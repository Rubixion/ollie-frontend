import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getIp } from "@/lib/rate-limit"
import { getAuthUser } from "@/lib/auth-server"
import { isPro } from "@/lib/pro"
import { instruction, type Look } from "@/lib/style/editor"
import type { Texture } from "@/lib/style/catalog"

// Hidden /style editor: the user's photo + chosen look -> an AI-edited photo (Gemini image editing).
// The photo is only sent when the user ticked consent, isn't stored by Ollie, and Gemini is asked not to store it (store: false).
const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const TEXTURES: Texture[] = ["straight", "wavy", "curly", "coily"]
const MODEL = process.env.STYLE_IMAGE_MODEL ?? "gemini-3.1-flash-image"
const DAILY = 15 // renders per IP per day

type Img = { data?: string; uri?: string; mime_type?: string }

// The Interactions API nests the image under steps[].content[] (or output_image); find it wherever it is.
function findImage(x: unknown): Img | null {
  if (!x || typeof x !== "object") return null
  const o = x as Record<string, unknown>
  if (o.type === "image" && (typeof o.data === "string" || typeof o.uri === "string")) return o as Img
  for (const v of Object.values(o)) {
    const hit = findImage(v)
    if (hit) return hit
  }
  return null
}

// The product's own photo (its page's og:image), sent to the model as a reference so the real item is copied.
// Only ever called with URLs from lib/style/catalog.ts. Best effort: no photo = text description only.
// ponytail: most brand sites hide og:image from servers (2 of 15 worked on 2026-09-30); use affiliate-feed image URLs once approved.
async function productPhoto(page: string): Promise<{ mime_type: string; data: string } | null> {
  try {
    const html = await (await fetch(page, { headers: { "User-Agent": "Mozilla/5.0 (OllieBot)" }, signal: AbortSignal.timeout(6000) })).text()
    const src = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1] ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image/i)?.[1]
    if (!src) return null
    const r = await fetch(new URL(src.replace(/&amp;/g, "&"), page), { signal: AbortSignal.timeout(6000) })
    const mime = r.headers.get("content-type")?.split(";")[0] ?? ""
    const buf = Buffer.from(await r.arrayBuffer())
    if (!r.ok || !/^image\/(jpeg|png|webp)$/.test(mime) || buf.length > 3 * 1024 * 1024) return null
    return { mime_type: mime, data: buf.toString("base64") }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  // AI try-on is the paid part of /style (the 3D try-on is free)
  const user = await getAuthUser(req)
  if (!isPro(user)) {
    return NextResponse.json({ error: "AI try-on on your own photo is part of Ollie Pro.", code: user ? "pro_required" : "signin" }, { status: 402 })
  }
  const ip = getIp(req)
  // ponytail: per-instance, in-memory limits; move to Supabase (like search-quota) before /style goes public
  if (!checkRateLimit(`render:${ip}`, 3, 60_000) || !checkRateLimit(`render-day:${ip}`, DAILY, 86_400_000)) {
    return NextResponse.json({ error: "You've made a lot of previews. Please try again later." }, { status: 429 })
  }
  const body = await req.json().catch(() => null)
  if (body?.consent !== true) return NextResponse.json({ error: "Tick the box to allow sending your photo." }, { status: 400 })
  const parsed = typeof body.image === "string" && body.image.length <= MAX_IMAGE_BYTES ? body.image.match(/^data:(image\/(?:jpeg|png));base64,(.+)$/) : null
  if (!parsed) return NextResponse.json({ error: "Invalid photo." }, { status: 400 })
  const look: Look = body.look && typeof body.look === "object" ? body.look : {}
  const texture = TEXTURES.includes(body.texture) ? (body.texture as Texture) : undefined
  const built = instruction(look, texture)
  if (!built) return NextResponse.json({ error: "Pick at least one thing to try on." }, { status: 400 })

  const key = process.env.GEMINI_API_KEY
  if (!key) return NextResponse.json({ error: "Previews are not configured yet." }, { status: 503 })

  const refs = (await Promise.all(built.refs.map((r) => productPhoto(r.url)))).filter((r) => r !== null)

  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        store: false,
        input: [
          { type: "text", text: refs.length ? `${built.text}
The extra images after the photo show the exact products: copy their colour, fabric and details.` : built.text },
          { type: "image", mime_type: parsed[1], data: parsed[2] },
          ...refs.map((r) => ({ type: "image", ...r })),
        ],
        response_format: { type: "image", mime_type: "image/jpeg" },
      }),
      signal: AbortSignal.timeout(120_000),
    })
    if (!res.ok) {
      console.error("style-render: Gemini", res.status, (await res.text()).slice(0, 500))
      return NextResponse.json({ error: "The preview failed. Please try again." }, { status: 502 })
    }
    const img = findImage(await res.json())
    if (!img) return NextResponse.json({ error: "The model didn't return an image. Try a different combination." }, { status: 502 })
    let data = img.data
    if (!data && img.uri) {
      const r = await fetch(img.uri, { headers: { "x-goog-api-key": key } })
      data = Buffer.from(await r.arrayBuffer()).toString("base64")
    }
    return NextResponse.json({ image: `data:${img.mime_type ?? "image/jpeg"};base64,${data}` })
  } catch (e) {
    console.error("style-render:", e)
    return NextResponse.json({ error: "The preview took too long. Please try again." }, { status: 504 })
  }
}
