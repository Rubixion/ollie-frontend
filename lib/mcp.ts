// Shared by the ChatGPT apps (MCP servers): app/mcp/lookalike (Celebrity Lookalike; /mcp is an alias), app/mcp/symmetry, app/mcp/stylist.
// Each app is its own listing in the OpenAI plugin portal; its URL can never change after submission.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { z } from "zod"
import { SITE_URL } from "@/lib/site-config"
import { consumeSearch, guestId, refundSearch, searchesUsed, USER_LIMIT, USER_WINDOW } from "@/lib/search-quota"
import { widgetMeta, widgetResult } from "@/lib/mcp-widget"
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
    "Only for clients that cannot attach files (e.g. claude.ai): the image bytes as base64 or a data: URL. In ChatGPT, never use this: pass the uploaded file in the photo field instead.",
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

/** JPEG / PNG / GIF / WebP / HEIC-AVIF from the first 12 bytes, or null. */
export function imageType(b: Uint8Array): string | null {
  const s = (i: number, t: string) => [...t].every((c, j) => b[i + j] === c.charCodeAt(0))
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg"
  if (b[0] === 0x89 && s(1, "PNG")) return "image/png"
  if (s(0, "GIF8")) return "image/gif"
  if (s(0, "RIFF") && s(8, "WEBP")) return "image/webp"
  if (s(4, "ftyp")) return s(8, "avif") ? "image/avif" : ["heic", "heix", "mif1", "msf1"].some((t) => s(8, t)) ? "image/heic" : null // not mp4
  return null
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
  // Trust the ACTUAL bytes, never the attacker-supplied f.mime_type. File stores (ChatGPT's included) often serve
  // uploads as application/octet-stream, so sniff the magic number when the header doesn't say image/*.
  if (blob.type.startsWith("image/")) return blob
  const sniffed = imageType(new Uint8Array(await blob.slice(0, 12).arrayBuffer()))
  if (!sniffed) throw new Error(`not an image (${blob.type || "no type"})`)
  return new Blob([blob], { type: sniffed })
}

// Plain-text replies (errors, "no face found", etc.). Also sent to the widget as a message card, or a tool whose
// output template is the widget would sit on the loading skeleton forever.
export const text = (t: string, structured?: Record<string, unknown>) => ({
  content: [{ type: "text" as const, text: t }],
  ...(structured ? { structuredContent: structured } : {}),
  _meta: { "ollie/widget": { kind: "message", body: t } },
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
    const call = () => fetch(`${baseUrl.replace(/\/$/, "")}/${path}`, {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: form,
      signal: AbortSignal.timeout(90_000), // a cold Modal container takes ~15-25 s
    })
    // one retry on a dropped connection or a 5xx (Modal swapping containers); not on a timeout, which already took 90 s
    let res = await call().catch((e) => { if (e?.name === "TimeoutError") throw e; return null })
    if (!res || res.status >= 500) res = await call()
    if (!res.ok) throw new Error(`inference ${res.status}`)
    // searches left after this one: null = not counted (the free symmetry app, or an exempt account)
    const left = quota && quota.used !== null ? Math.max(0, (auth ? USER_LIMIT : GUEST_MCP_LIMIT) - quota.used) : null
    return { data: await res.json(), left }
  } catch (err) {
    console.error("mcp inference failed:", err)
    if (quota) await refundSearch(quota)
    // the short reason (e.g. "download 403", "inference 500") makes failures diagnosable from the ChatGPT tool panel
    const why = (err instanceof Error ? err.message : String(err)).slice(0, 80)
    return { error: `The photo couldn't be checked (${why}). Try again with a clear, front-facing JPG or PNG photo.` }
  }
}

/** "N of 25 left today" after a counted photo search, or "" when it isn't counted. */
export function leftLine(left: number | null | undefined, auth: McpAuth | "free"): string {
  if (left == null || auth === "free") return ""
  if (auth) return `${left} of ${USER_LIMIT} photo searches left today on your Ollie account.`
  return left > 0 ? `${left} free photo search left today.` : `That was today's free photo search. Connect your Ollie account in ChatGPT for ${USER_LIMIT} a day.`
}

/** Adds the usage line to a tool result: the model's text and the card. */
export function withUsage<T extends { content: { type: "text"; text: string }[]; _meta?: Record<string, unknown> }>(res: T, line: string): T {
  if (!line) return res
  res.content[0].text += `

${line}`
  const w = res._meta?.["ollie/widget"] as Record<string, unknown> | undefined
  if (w) w.usage = line
  return res
}

/** check_usage: how many photo searches the user has left today (lookalike + stylist; symmetry is free). */
export function registerUsageTool(server: McpServer, auth: McpAuth) {
  server.registerTool(
    "check_usage",
    {
      title: "Check my Ollie searches left today",
      description:
        "Shows how many Ollie photo searches the user has left today and when the next one frees up. Use this when the user asks " +
        "'how many searches do I have left', 'check my usage', 'what's my limit' or 'why can't I search'. No photo needed.",
      inputSchema: {},
      annotations: readOnly,
      _meta: { ...widgetMeta, "openai/toolInvocation/invoking": "Checking your searches…", "openai/toolInvocation/invoked": "Checked your searches" },
    },
    async (_args, extra) => {
      const subject = typeof extra._meta?.["openai/subject"] === "string" ? extra._meta["openai/subject"] : "anon"
      const limit = auth ? USER_LIMIT : GUEST_MCP_LIMIT
      const r = await searchesUsed(auth ? auth.userId : await guestId(`chatgpt:${subject}`), USER_WINDOW ?? "24 hours")
      if (!r) return text("Ollie couldn't check your searches right now. Please try again shortly.")
      const free = "Free and unlimited: famous lookalikes of any celebrity, haircuts for a named face shape, and the face symmetry test."
      if (r === "exempt") return text(`This Ollie account has unlimited photo searches. ${free}`)
      const left = Math.max(0, limit - r.used)
      const hrs = r.oldest ? Math.max(1, Math.ceil((new Date(r.oldest).getTime() + 24 * 3600_000 - Date.now()) / 3600_000)) : 0
      const next = left === 0 && hrs ? ` The next one frees up in about ${hrs} hour${hrs === 1 ? "" : "s"}.` : ""
      const plan = auth
        ? `Your Ollie account gets ${USER_LIMIT} photo searches a day, shared between ChatGPT and ollieml.com.`
        : `Without an account you get ${GUEST_MCP_LIMIT} free photo search a day. Connect your Ollie account in ChatGPT for ${USER_LIMIT} a day.`
      return widgetResult(
        `The user has ${left} of ${limit} photo searches left today (${r.used} used in the last 24 hours).${next} ${plan} ${free}`,
        { searches_left: left, daily_limit: limit, used_last_24h: r.used, connected: Boolean(auth) },
        {
          kind: "usage", title: "Your Ollie searches", left, limit,
          verdict: left ? `${left} left today` : "None left today",
          sub: `${plan}${next}`,
          foot: free,
          cta: auth ? { label: "Search on ollieml.com →", href: link("/celebrity-lookalike") } : undefined,
        },
      )
    },
  )
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
// claude: true on the bare /mcp alias (the claude.ai connector). Only there do photo tools take base64: ChatGPT, offered it,
// re-encodes the upload and types ~30k characters into the tool call, which takes minutes.
export function serve(name: string, build: (server: McpServer, auth: McpAuth, claude: boolean) => void) {
  return async (req: Request) => {
    const auth = await getMcpUser(req)
    const server = new McpServer({ name, version: "1.0.0" }, { instructions: SERVER_INSTRUCTIONS })
    build(server, auth, new URL(req.url).pathname === "/mcp")
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
    await server.connect(transport)
    return transport.handleRequest(req)
  }
}
