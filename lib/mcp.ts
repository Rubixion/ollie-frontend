// Shared by the ChatGPT apps (MCP servers): app/mcp (Celebrity Lookalike), app/mcp/symmetry, app/mcp/stylist.
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

async function download(f: ImageFile): Promise<Blob> {
  let url: URL
  try {
    url = new URL(f.download_url)
  } catch {
    throw new Error("bad url")
  }
  if (url.protocol !== "https:" || isPrivateHost(url.hostname)) throw new Error("bad url")
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
  if (!res.ok) throw new Error(`download ${res.status}`)
  // Reject oversized bodies by their declared length before reading them into memory.
  const declared = Number(res.headers.get("content-length") ?? "0")
  if (declared > MAX_IMAGE_BYTES) throw new Error("too large")
  const blob = await res.blob()
  if (blob.size > MAX_IMAGE_BYTES) throw new Error("too large") // backstop for chunked responses with no content-length
  if (!(f.mime_type ?? blob.type).startsWith("image/")) throw new Error("not an image")
  return blob
}

export const text = (t: string, structured?: Record<string, unknown>) => ({
  content: [{ type: "text" as const, text: t }],
  ...(structured ? { structuredContent: structured } : {}),
})

// Sends photos to the Modal server under a daily cap (Supabase, fails closed), refunded on failure.
// Connected users are keyed on their real Supabase id, so the pool is shared with the website and every tool.
// Anonymous users are keyed on ChatGPT's openai/subject and get GUEST_MCP_LIMIT; the "ip" slot mirrors the same key.
// moreAt: the site page to send people to once they've used the day's checks.
export async function inference(path: "search" | "compare" | "landmarks", files: ImageFile[], meta: Record<string, unknown> | undefined, moreAt: string, auth: McpAuth) {
  const baseUrl = process.env.INFERENCE_URL, apiKey = process.env.INFERENCE_API_KEY
  if (!baseUrl || !apiKey) return { error: "Ollie isn't available right now." }
  const subject = typeof meta?.["openai/subject"] === "string" ? meta["openai/subject"] : "anon"
  const ipSlot = `chatgpt-sub:${subject}`
  const userId = auth ? auth.userId : await guestId(`chatgpt:${subject}`)
  const limit = auth ? USER_LIMIT : GUEST_MCP_LIMIT
  const quota = await consumeSearch(userId, ipSlot, limit, auth ? USER_WINDOW ?? "24 hours" : "24 hours")
  if (!quota.ok) {
    if (quota.reason === "unavailable") return { error: "Ollie is temporarily unavailable. Please try again shortly." }
    return {
      error: auth
        ? `That's your daily limit of Ollie searches. It resets tomorrow — or use the site: ${link(moreAt)}`
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
    await refundSearch(quota)
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
    const server = new McpServer({ name, version: "1.0.0" })
    build(server, auth)
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
    await server.connect(transport)
    return transport.handleRequest(req)
  }
}
