// OAuth 2.1 authorization server for the ChatGPT MCP apps. Hand-rolled on Supabase (see supabase/oauth.sql).
// Public clients only (PKCE S256, no client secret) — that's what ChatGPT registers as.
// Security notes: codes and tokens are random 256-bit values; only their sha256 is stored; codes are one-time and
// short-lived; redirect_uris are matched exactly. All DB access uses the service role (RLS blocks everyone else).
import { createClient } from "@supabase/supabase-js"
import { SITE_URL } from "@/lib/site-config"

export const ISSUER = SITE_URL // the OAuth issuer and base URL for every endpoint; must equal the live origin
export const OAUTH_SCOPE = "ollie.search"
const CODE_TTL_S = 300 // 5 min to complete the token exchange after consent
const ACCESS_TTL_S = 30 * 24 * 3600 // long-lived so people don't re-connect constantly; the daily search cap is the real limit
const REFRESH_TTL_S = 180 * 24 * 3600

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

/** A client is valid only if it exists and the redirect_uri is one it registered (exact match). */
export async function validateClientRedirect(client_id: string, redirect_uri: string): Promise<boolean> {
  const c = await getClient(client_id)
  return !!c && c.redirect_uris.includes(redirect_uri)
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

/** One-time: looks the code up, deletes it, and returns it only if unexpired and matching the client+redirect. */
export async function consumeCode(code: string, client_id: string, redirect_uri: string) {
  const d = db()
  if (!d) return null
  const code_hash = await sha256(code)
  const { data } = await d.from("oauth_codes").select("*").eq("code_hash", code_hash).maybeSingle()
  if (data) await d.from("oauth_codes").delete().eq("code_hash", code_hash) // burn it whether or not it checks out
  if (!data) return null
  if (new Date(data.expires_at).getTime() < Date.now()) return null
  if (data.client_id !== client_id || data.redirect_uri !== redirect_uri) return null
  return data as { user_id: string; code_challenge: string; scope: string }
}

// ─── access / refresh tokens ─────────────────────────────────────────────────
export async function issueTokens(user_id: string, client_id: string, scope: string) {
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

/** Refresh-token rotation: the old refresh token is replaced by a brand-new pair. */
export async function rotateRefreshToken(refresh: string, client_id: string) {
  const d = db()
  if (!d || !refresh) return null
  const refresh_hash = await sha256(refresh)
  const { data } = await d.from("oauth_tokens").select("*").eq("refresh_hash", refresh_hash).maybeSingle()
  if (!data || data.client_id !== client_id || new Date(data.refresh_expires_at).getTime() < Date.now()) return null
  await d.from("oauth_tokens").delete().eq("refresh_hash", refresh_hash)
  return issueTokens(data.user_id, data.client_id, data.scope)
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
