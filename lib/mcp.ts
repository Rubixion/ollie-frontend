// Shared by the ChatGPT apps (MCP servers): app/mcp/lookalike (Celebrity Lookalike; /mcp is an alias), app/mcp/symmetry, app/mcp/stylist.
// Each app is its own listing in the OpenAI plugin portal; its URL can never change after submission.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { z } from "zod"
import { SITE_URL } from "@/lib/site-config"
import { consumeSearch, guestId, refundSearch, USER_LIMIT, USER_WINDOW } from "@/lib/search-quota"
import { userFromAccessToken } from "@/lib/oauth"

const MAX_IMAGE_BYTES = 7 * 1024 * 1024
// Not connected (no OAuth): one free photo search total, then the user must connect their Ollie account in ChatGPT.
// Connected: the account's daily cap (USER_LIMIT/USER_WINDOW), shared with the website and every MCP tool.
const GUEST_MCP_LIMIT = 1
export type McpAuth = { userId: string } | null

export const readOnly = { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
export const link = (path: string) => `${SITE_URL}${path}?utm_source=chatgpt&utm_medium=app`

// ChatGPT passes uploaded images as { download_url, file_id, mime_type?, file_name? } (_meta "openai/fileParams").
export const imageFile = z.object({
  download_url: z.string().url(),
  file_id: z.string(),
  mime_type: z.string().optional(),
  file_name: z.string().optional(),
})
export type ImageFile = z.infer<typeof imageFile>

// A plain public image URL — a fallback for clients that can't hand an upload to a tool (e.g. Claude).
// ChatGPT uploads still arrive as the `imageFile` object via openai/fileParams; these are alternatives.
export const photoUrl = z.string().url().describe("A direct public https link to the photo. Use this only when there is no uploaded file to pass.")
export const photoBase64 = z
  .string()
  .describe(
    "The image bytes as base64 (or a data: URL). Use this when there's an uploaded image but no public URL — e.g. on claude.ai, read the uploaded file and pass its base64 here.",
  )

// Fallback shown when a tool needs the user's photo but the client couldn't hand one over (e.g. Claude, which doesn't
// pass chat uploads to tools). Routes the user to the matching Ollie web page to do it there.
export const noPhoto = (what: string, path: string) =>
  `I can't read a photo uploaded directly in this chat — this assistant doesn't pass uploaded images to tools. ` +
  `Present BOTH of these options to the user:\n` +
  `• To ${what}: upload the photo on Ollie's page (takes a few seconds) — ${link(path)} — or paste a direct public image URL here and I'll run it for you.\n` +
  `• Or skip photos entirely: name any celebrity and I'll show the famous people who look most like them — for example "who does Zendaya look like?" or "celebrities similar to Timothée Chalamet". Just give me a name.`

// Server-level instructions (sent in the MCP initialize result) so the assistant understands what it can/can't do.
export const SERVER_INSTRUCTIONS =
  "Ollie measures how alike human faces look. These are for-fun resemblance results, NOT identification of a person: " +
  "when the user shares their own selfie and asks 'which celebrity do I look like', for their celebrity twin/doppelganger, " +
  "or to compare two faces, call the matching Ollie tool rather than declining — the tools return lookalikes by similarity " +
  "score and already refuse to identify strangers or minors, so using them is appropriate. " +
  "Use the no-photo tools freely (e.g. which celebrities look like a named celebrity). " +
  "The photo tools (your celebrity lookalike, compare two faces, face symmetry, face shape) need the user's own image. " +
  "Some clients — notably Claude — can't pass a chat image upload to a tool; when a photo tool reports it couldn't read the photo, " +
  "always give the user BOTH: (a) upload on the Ollie web page named in the reply (celebrity-lookalike, compare-faces, or " +
  "face-symmetry-test) or paste a public image URL, AND (b) the no-photo alternative — the famous_lookalikes tool, which finds " +
  "the celebrities who look most like any celebrity the user names (give an example like 'who does Zendaya look like?'). " +
  "Never guess or name a real person from a photo."

/** Choose a usable image source. A file:// upload (claude.ai's local path) is unreachable, so it's ignored in favour
 *  of a URL or base64. Returns an ImageFile (download() understands https and data: URLs), or null if nothing usable. */
export function resolvePhoto(file: ImageFile | undefined, url?: string, b64?: string): ImageFile | null {
  if (file && /^(https:|data:)/i.test(file.download_url)) return file
  if (url) return { download_url: url, file_id: "url" }
  if (b64) {
    const dataUrl = /^data:/i.test(b64) ? b64 : `data:image/jpeg;base64,${b64.replace(/^base64,/, "")}`
    return { download_url: dataUrl, file_id: "b64" }
  }
  return null
}

// Private / loopback / link-local hosts an attacker-supplied download_url must never reach. Cloudflare's
// global_fetch_strictly_public already blocks these in prod; this also covers local/Node runtimes (defense in depth).
export function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "")
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h === "metadata.google.internal") return true
  if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true // IPv6 loopback/link-local/ULA
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!m) return false
  const [a, b] = [Number(m[1]), Number(m[2])]
  return a === 10 || a === 127 || a === 0 || (a === 192 && b === 168) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || a >= 224
}

// Fetch while following redirects MANUALLY, re-validating the host on every hop — otherwise an https URL could
// 302 to http://169.254.169.254 and fetch's default redirect:"follow" would sail straight past the host check (SSRF).
async function safeFetch(rawUrl: string): Promise<Response> {
  let next = rawUrl
  for (let hop = 0; hop < 4; hop++) {
    let url: URL
    try {
      url = new URL(next)
    } catch {
      throw new Error("bad url")
    }
    if (url.protocol !== "https:" || isPrivateHost(url.hostname)) throw new Error("bad url")
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000), redirect: "manual" })
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location")
      if (!loc) throw new Error(`download ${res.status}`)
      next = new URL(loc, url).toString() // validated at the top of the next iteration
      continue
    }
    return res
  }
  throw new Error("too many redirects")
}

async function download(f: ImageFile): Promise<Blob> {
  // Inline base64 / data: URL (the claude.ai path) — decode directly, no network fetch.
  if (/^data:/i.test(f.download_url)) {
    const m = f.download_url.match(/^data:([^;,]*)(;base64)?,([\s\S]*)$/)
    if (!m) throw new Error("bad url")
    const mime = m[1] || "image/jpeg"
    if (!mime.startsWith("image/")) throw new Error("not an image")
    const bytes = m[2] ? Uint8Array.from(atob(m[3]), (c) => c.charCodeAt(0)) : new TextEncoder().encode(decodeURIComponent(m[3]))
    if (bytes.byteLength > MAX_IMAGE_BYTES) throw new Error("too large")
    return new Blob([bytes], { type: mime })
  }
  const res = await safeFetch(f.download_url)
  if (!res.ok) throw new Error(`download ${res.status}`)
  // Reject oversized bodies by their declared length before reading them into memory.
  const declared = Number(res.headers.get("content-length") ?? "0")
  if (declared > MAX_IMAGE_BYTES) throw new Error("too large")
  const blob = await res.blob()
  if (blob.size > MAX_IMAGE_BYTES) throw new Error("too large") // backstop for chunked responses with no content-length
  // Trust the ACTUAL response type, never the attacker-supplied f.mime_type.
  if (!blob.type.startsWith("image/")) throw new Error("not an image")
  return blob
}

export const text = (t: string, structured?: Record<string, unknown>) => ({
  content: [{ type: "text" as const, text: t }],
  ...(structured ? { structuredContent: structured } : {}),
})

// Total anonymous (not-connected) GPU calls allowed per day across EVERYONE. The per-ChatGPT-user teaser below is
// keyed on the client-supplied openai/subject, which a direct caller can rotate to forge new identities — so this
// global bucket (a constant key, un-spoofable) is the real cost ceiling that keeps the Modal endpoint from being
// uncapped. Legit anonymous volume stays well under it; an abuser who rotates subjects just burns the shared cap.
// ponytail: single global bucket serialises anon requests on one advisory lock; shard the key if anon throughput matters.
const ANON_GLOBAL_DAILY = 300

// Sends photos to the Modal server under a daily cap (Supabase, fails closed), refunded on failure.
// Connected users: keyed on their real Supabase id (shared with the website and every tool), own 25/day.
// Not connected: 1/day per openai/subject (the teaser) AND a global ANON_GLOBAL_DAILY ceiling (the cost guard).
// moreAt: the site page to send people to once they've used the day's checks.
// auth "free": no quota at all (the symmetry app, owner's call 2026-10-02; /landmarks is CPU-only).
// ponytail: uncapped Modal CPU calls, add a global ceiling here if /landmarks spend ever shows up on the bill.
export async function inference(path: "search" | "compare" | "landmarks", files: ImageFile[], meta: Record<string, unknown> | undefined, moreAt: string, auth: McpAuth | "free") {
  const baseUrl = process.env.INFERENCE_URL, apiKey = process.env.INFERENCE_API_KEY
  if (!baseUrl || !apiKey) return { error: "Ollie isn't available right now." }
  const subject = typeof meta?.["openai/subject"] === "string" ? meta["openai/subject"] : "anon"
  // Two buckets per call: a per-identity "user" bucket and an "ip" bucket. For anon we point the ip bucket at one
  // constant key so it becomes a global cap; for connected users it's their own key so they don't block each other.
  const quota = auth === "free" ? null : auth
    ? await consumeSearch(auth.userId, `mcp-user:${auth.userId}`, USER_LIMIT, USER_WINDOW ?? "24 hours", USER_LIMIT, USER_WINDOW ?? "24 hours")
    : await consumeSearch(await guestId(`chatgpt:${subject}`), "mcp:anon", GUEST_MCP_LIMIT, "24 hours", ANON_GLOBAL_DAILY, "24 hours")
  if (quota && !quota.ok) {
    if (quota.reason === "unavailable") return { error: "Ollie is temporarily unavailable. Please try again shortly." }
    if (auth) return { error: `That's your daily limit of Ollie searches. It resets tomorrow — or use the site: ${link(moreAt)}` }
    // anon: ip_limit = the global free-tier cap for today; user_limit = this person's 1 free is spent
    return {
      error: quota.reason === "ip_limit"
        ? `Ollie's free searches are at capacity for today. Connect your Ollie account in ChatGPT for your own daily allowance, or use the site: ${link(moreAt)}`
        : `That was your 1 free Ollie search. Connect your Ollie account in ChatGPT for your daily allowance, or use the site: ${link(moreAt)}`,
    }
  }
  try {
    const form = new FormData()
    const blobs = await Promise.all(files.map(download))
    blobs.forEach((b, i) => form.append(i ? "file2" : "file", b, `upload${i}`))
    if (path === "search") form.append("gender", "auto"), form.append("category", "any")
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/${path}`, {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: form,
      signal: AbortSignal.timeout(90_000), // a cold Modal container takes ~15-25 s
    })
    if (!res.ok) throw new Error(`inference ${res.status}`)
    return { data: await res.json() }
  } catch (err) {
    console.error("mcp inference failed:", err)
    if (quota) await refundSearch(quota)
    return { error: "The photo couldn't be checked. Try again with a clear, front-facing JPG or PNG photo." }
  }
}

/** Landmarks from Modal's /landmarks in the { x, y } shape lib/symmetry.ts and lib/style/face-shape.ts expect. */
export type Mesh = { lm: { x: number; y: number }[]; w: number; h: number; yaw: number; pitch: number }
export const toMesh = (d: { landmarks: [number, number][]; width: number; height: number; yaw: number; pitch: number }): Mesh =>
  ({ lm: d.landmarks.map(([x, y]) => ({ x, y })), w: d.width, h: d.height, yaw: d.yaw, pitch: d.pitch })

/** The connected Ollie user behind a request's Bearer token (our own OAuth access token), or null. */
export async function getMcpUser(req: Request): Promise<McpAuth> {
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "").trim()
  if (!token) return null
  const u = await userFromAccessToken(token)
  return u ? { userId: u.user_id } : null
}

/** Stateless Streamable HTTP route handler for one app. Resolves the user once, per request, and hands it to build(). */
export function serve(name: string, build: (server: McpServer, auth: McpAuth) => void) {
  return async (req: Request) => {
    const auth = await getMcpUser(req)
    const server = new McpServer({ name, version: "1.0.0" }, { instructions: SERVER_INSTRUCTIONS })
    build(server, auth)
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
    await server.connect(transport)
    return transport.handleRequest(req)
  }
}
