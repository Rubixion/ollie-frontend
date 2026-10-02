// Shared by the ChatGPT apps (MCP servers): app/mcp (Celebrity Lookalike), app/mcp/symmetry, app/mcp/stylist.
// Each app is its own listing in the OpenAI plugin portal; its URL can never change after submission.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { z } from "zod"
import { SITE_URL } from "@/lib/site-config"
import { consumeSearch, guestId, refundSearch } from "@/lib/search-quota"

const MAX_IMAGE_BYTES = 7 * 1024 * 1024
export const CHATGPT_LIMIT = 5 // photo checks per ChatGPT user per app per 24 hours (each one is a Modal call)

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

async function download(f: ImageFile): Promise<Blob> {
  if (!f.download_url.startsWith("https://")) throw new Error("bad url")
  const res = await fetch(f.download_url, { signal: AbortSignal.timeout(20_000) })
  if (!res.ok) throw new Error(`download ${res.status}`)
  const blob = await res.blob()
  if (blob.size > MAX_IMAGE_BYTES) throw new Error("too large")
  if (!(f.mime_type ?? blob.type).startsWith("image/")) throw new Error("not an image")
  return blob
}

export const text = (t: string, structured?: Record<string, unknown>) => ({
  content: [{ type: "text" as const, text: t }],
  ...(structured ? { structuredContent: structured } : {}),
})

// Sends photos to the Modal server under a per-ChatGPT-user daily cap (Supabase, fails closed), refunded on failure.
// ChatGPT calls come from OpenAI's servers, so the "ip" slot holds the user's anonymous openai/subject instead.
// moreAt: the site page to send people to once they've used the day's checks.
export async function inference(path: "search" | "compare" | "landmarks", files: ImageFile[], meta: Record<string, unknown> | undefined, moreAt: string) {
  const baseUrl = process.env.INFERENCE_URL, apiKey = process.env.INFERENCE_API_KEY
  if (!baseUrl || !apiKey) return { error: "Ollie isn't available right now." }
  const who = `chatgpt:${path === "landmarks" ? "face" : "match"}:${typeof meta?.["openai/subject"] === "string" ? meta["openai/subject"] : "anon"}`
  const quota = await consumeSearch(await guestId(who), who, CHATGPT_LIMIT, "24 hours")
  if (!quota.ok) {
    return { error: quota.reason === "unavailable" ? "Ollie is temporarily unavailable." : `That's today's ${CHATGPT_LIMIT} free photo checks. There are more at ${link(moreAt)}` }
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

/** Stateless Streamable HTTP route handler for one app. */
export function serve(name: string, build: (server: McpServer) => void) {
  return async (req: Request) => {
    const server = new McpServer({ name, version: "1.0.0" })
    build(server)
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
    await server.connect(transport)
    return transport.handleRequest(req)
  }
}
