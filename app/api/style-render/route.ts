import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getIp } from "@/lib/rate-limit"
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

export async function POST(req: NextRequest) {
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
  const prompt = instruction(look, texture)
  if (!prompt) return NextResponse.json({ error: "Pick at least one thing to try on." }, { status: 400 })

  const key = process.env.GEMINI_API_KEY
  if (!key) return NextResponse.json({ error: "Previews are not configured yet." }, { status: 503 })

  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        store: false,
        input: [
          { type: "text", text: prompt },
          { type: "image", mime_type: parsed[1], data: parsed[2] },
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
