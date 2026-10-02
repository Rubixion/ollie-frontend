// OAuth 2.1 authorization server for the ChatGPT MCP apps. Hand-rolled on Supabase (see supabase/oauth.sql).
// Public clients only (PKCE S256, no client secret) — that's what ChatGPT registers as.
// Security notes: codes and tokens are random 256-bit values; only their sha256 is stored; codes are one-time and
// short-lived; redirect_uris are matched exactly. All DB access uses the service role (RLS blocks everyone else).
import { createClient } from "@supabase/supabase-js"
import { SITE_URL } from "@/lib/site-config"

export const ISSUER = SITE_URL // the OAuth issuer and base URL for every endpoint; must equal the live origin
export const OAUTH_SCOPE = "ollie.search"
const CODE_TTL_S = 300 // 5 min to complete the token exchange after consent
const ACCESS_TTL_S = 3600 // 1 h: short, so a leaked access token dies fast; ChatGPT silently refreshes
const REFRESH_TTL_S = 180 * 24 * 3600
const REGISTER_PER_IP_PER_DAY = 8 // dynamic-registration cap per IP (DB-backed)

// Redirect targets we accept at registration. The attack we're blocking is a remote attacker host (evil.com)
// receiving a victim's auth code (consent-phishing via open DCR). Two things are safe:
//  - loopback (http://localhost:PORT) — native desktop/CLI MCP clients (Claude Desktop, Claude Code, Cursor, Gemini CLI)
//    use it, and the code only reaches the user's own machine;
//  - remote https on a known MCP-client vendor host.
// Everything else is rejected. Add vendor hosts without a deploy via OAUTH_ALLOWED_REDIRECT_HOSTS (comma-separated),
// and rejected hosts are logged so you can spot a legit client that needs adding.
const DEFAULT_REDIRECT_HOSTS = [
  "openai.com", "chatgpt.com", "oaiusercontent.com", // ChatGPT
  "claude.ai", "claude.com", "anthropic.com", // Claude (web + desktop)
  "perplexity.ai", // Perplexity
  "cursor.com", "cursor.sh", // Cursor
  "google.com", "googleusercontent.com", // Gemini
]

const isLoopbackHost = (host: string) => {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase()
  return h === "localhost" || h === "127.0.0.1" || h === "::1" || h.endsWith(".localhost")
}

/** Is this redirect_uri safe to register/use? Loopback (any port) or https on an allowed vendor host. */
export function redirectAllowed(uri: string): boolean {
  let u: URL
  try {
    u = new URL(uri)
  } catch {
    return false
  }
  if (isLoopbackHost(u.hostname)) return u.protocol === "http:" || u.protocol === "https:"
  if (u.protocol !== "https:") return false
  const host = u.hostname.toLowerCase()
  const extra = (process.env.OAUTH_ALLOWED_REDIRECT_HOSTS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  return [...DEFAULT_REDIRECT_HOSTS, ...extra].some((a) => host === a || host.endsWith("." + a))
}

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

/** A cryptographically random URL-safe token (default 256 bits). */
export function randomToken(nBytes = 32): string {
  const a = new Uint8Array(nBytes)
  crypto.getRandomValues(a)
  return b64url(a)
}

export async function sha256(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))
  return b64url(new Uint8Array(d))
}

/** RFC 7636 PKCE: challenge must equal BASE64URL(SHA256(verifier)). */
export async function verifyPkce(verifier: string, challenge: string): Promise<boolean> {
  if (!verifier || !challenge || verifier.length < 43 || verifier.length > 128) return false
  return (await sha256(verifier)) === challenge
}

// ─── clients (dynamic registration, RFC 7591) ────────────────────────────────
export type OAuthClient = { client_id: string; client_name: string | null; redirect_uris: string[] }

/** Durable per-IP cap on dynamic client registration. Records the attempt and returns false when over the daily limit. */
export async function canRegister(ip: string): Promise<boolean> {
  const d = db()
  if (!d) return false
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  const { count } = await d.from("oauth_register_log").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", since)
  if ((count ?? 0) >= REGISTER_PER_IP_PER_DAY) return false
  await d.from("oauth_register_log").insert({ ip })
  return true
}

export async function registerClient(redirect_uris: string[], client_name?: string): Promise<OAuthClient | null> {
  const d = db()
  if (!d) return null
  const client_id = randomToken(16)
  const row = { client_id, client_name: client_name ?? null, redirect_uris }
  const { error } = await d.from("oauth_clients").insert(row)
  if (error) {
    console.error("oauth registerClient:", error.message)
    return null
  }
  return row
}

export async function getClient(client_id: string): Promise<OAuthClient | null> {
  const d = db()
  if (!d) return null
  const { data } = await d.from("oauth_clients").select("client_id, client_name, redirect_uris").eq("client_id", client_id).maybeSingle()
  return data as OAuthClient | null
}

/** Valid only if the client exists, the redirect_uri is one it registered (exact match), and it's an allowed target.
 *  The allowlist is re-checked here (not just at registration) so a client registered before the rule can't use evil hosts. */
export async function validateClientRedirect(client_id: string, redirect_uri: string): Promise<boolean> {
  const c = await getClient(client_id)
  return !!c && c.redirect_uris.includes(redirect_uri) && redirectAllowed(redirect_uri)
}

// ─── authorization codes ─────────────────────────────────────────────────────
export async function issueCode(p: {
  client_id: string
  user_id: string
  redirect_uri: string
  code_challenge: string
  scope: string
}): Promise<string | null> {
  const d = db()
  if (!d) return null
  const code = randomToken()
  const { error } = await d.from("oauth_codes").insert({
    code_hash: await sha256(code),
    client_id: p.client_id,
    user_id: p.user_id,
    redirect_uri: p.redirect_uri,
    code_challenge: p.code_challenge,
    scope: p.scope,
    expires_at: new Date(Date.now() + CODE_TTL_S * 1000).toISOString(),
  })
  if (error) {
    console.error("oauth issueCode:", error.message)
    return null
  }
  return code
}

/** One-time: validates the code, and only burns it on a correct match (so a wrong-client attempt can't DoS a real code). */
export async function consumeCode(code: string, client_id: string, redirect_uri: string) {
  const d = db()
  if (!d) return null
  const code_hash = await sha256(code)
  const { data } = await d.from("oauth_codes").select("*").eq("code_hash", code_hash).maybeSingle()
  if (!data) return null
  if (new Date(data.expires_at).getTime() < Date.now() || data.client_id !== client_id || data.redirect_uri !== redirect_uri) {
    return null // leave the row; the legitimate client can still redeem it (PKCE still gates the exchange)
  }
  await d.from("oauth_codes").delete().eq("code_hash", code_hash) // valid match: burn it so it's single-use
  return data as { user_id: string; code_challenge: string; scope: string }
}

// ─── access / refresh tokens ─────────────────────────────────────────────────
export async function issueTokens(user_id: string, client_id: string, scope: string, family_id?: string) {
  const d = db()
  if (!d) return null
  const access = randomToken()
  const refresh = randomToken()
  const now = Date.now()
  const { error } = await d.from("oauth_tokens").insert({
    token_hash: await sha256(access),
    refresh_hash: await sha256(refresh),
    client_id,
    user_id,
    scope,
    family_id: family_id ?? randomToken(16), // one family per original grant; rotations keep the same id
    expires_at: new Date(now + ACCESS_TTL_S * 1000).toISOString(),
    refresh_expires_at: new Date(now + REFRESH_TTL_S * 1000).toISOString(),
  })
  if (error) {
    console.error("oauth issueTokens:", error.message)
    return null
  }
  return { access_token: access, refresh_token: refresh, expires_in: ACCESS_TTL_S, scope }
}

/** The Supabase user id behind a valid, unexpired access token, or null. */
export async function userFromAccessToken(access: string): Promise<{ user_id: string; scope: string } | null> {
  const d = db()
  if (!d || !access) return null
  const { data } = await d.from("oauth_tokens").select("user_id, scope, expires_at").eq("token_hash", await sha256(access)).maybeSingle()
  if (!data || new Date(data.expires_at).getTime() < Date.now()) return null
  return { user_id: data.user_id, scope: data.scope }
}

/** Refresh-token rotation with reuse detection: replaying an already-rotated refresh token nukes the whole family. */
export async function rotateRefreshToken(refresh: string, client_id: string) {
  const d = db()
  if (!d || !refresh) return null
  const refresh_hash = await sha256(refresh)

  // Already rotated out and presented again = token theft. Revoke every token in that family.
  const { data: used } = await d.from("oauth_used_refresh").select("family_id").eq("refresh_hash", refresh_hash).maybeSingle()
  if (used) {
    await d.from("oauth_tokens").delete().eq("family_id", used.family_id)
    console.error("oauth: refresh-token reuse detected; family revoked")
    return null
  }

  const { data } = await d.from("oauth_tokens").select("*").eq("refresh_hash", refresh_hash).maybeSingle()
  if (!data || data.client_id !== client_id || new Date(data.refresh_expires_at).getTime() < Date.now()) return null

  // Retire the old refresh token (so any later replay trips the check above), then issue a new pair in the same family.
  await d.from("oauth_used_refresh").insert({ refresh_hash, family_id: data.family_id, expires_at: data.refresh_expires_at })
  await d.from("oauth_tokens").delete().eq("refresh_hash", refresh_hash)
  return issueTokens(data.user_id, data.client_id, data.scope, data.family_id)
}

// ─── revocation (RFC 7009) + user-facing disconnect ──────────────────────────
/** Revoke by access or refresh token (RFC 7009). Always treated as success by the caller. */
export async function revokeToken(token: string) {
  const d = db()
  if (!d || !token) return
  const h = await sha256(token)
  await d.from("oauth_tokens").delete().or(`token_hash.eq.${h},refresh_hash.eq.${h}`)
}

/** The apps a user has connected (one row per client they hold tokens for). */
export async function listConnections(user_id: string) {
  const d = db()
  if (!d) return []
  const { data } = await d.from("oauth_tokens").select("client_id, created_at").eq("user_id", user_id)
  const byClient = new Map<string, string>()
  for (const r of data ?? []) if (!byClient.has(r.client_id)) byClient.set(r.client_id, r.created_at)
  const out = []
  for (const [client_id, created_at] of byClient) {
    const c = await getClient(client_id)
    out.push({ client_id, client_name: c?.client_name ?? null, connected_at: created_at })
  }
  return out
}

/** Disconnect one app (or all) for a user — deletes their tokens so the app loses access immediately. */
export async function revokeUserConnections(user_id: string, client_id?: string) {
  const d = db()
  if (!d) return
  let q = d.from("oauth_tokens").delete().eq("user_id", user_id)
  if (client_id) q = q.eq("client_id", client_id)
  await q
}

// ─── discovery metadata ──────────────────────────────────────────────────────
export const authServerMetadata = () => ({
  issuer: ISSUER,
  authorization_endpoint: `${ISSUER}/oauth/authorize`,
  token_endpoint: `${ISSUER}/oauth/token`,
  registration_endpoint: `${ISSUER}/oauth/register`,
  response_types_supported: ["code"],
  grant_types_supported: ["authorization_code", "refresh_token"],
  code_challenge_methods_supported: ["S256"],
  token_endpoint_auth_methods_supported: ["none"],
  scopes_supported: [OAUTH_SCOPE],
})

export const protectedResourceMetadata = (resource: string) => ({
  resource,
  authorization_servers: [ISSUER],
  scopes_supported: [OAUTH_SCOPE],
  bearer_methods_supported: ["header"],
})

// CORS for the endpoints ChatGPT fetches cross-origin (discovery, register, token).
export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}
