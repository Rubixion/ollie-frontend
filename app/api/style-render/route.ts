import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getIp } from "@/lib/rate-limit"
import { getAuthUser } from "@/lib/auth-server"
import { isPro } from "@/lib/pro"
import { consumeSearch, guestId, refundSearch } from "@/lib/search-quota"
import { instruction, type Look } from "@/lib/style/editor"
import type { Texture } from "@/lib/style/catalog"
import { REF_NOTE, geminiImage, productPhotos } from "@/lib/gemini"

// Ollie Stylist (/ai-stylist): the user's photo + chosen look -> an AI-edited photo (Gemini image editing).
// The photo is only sent when the user ticked consent, isn't stored by Ollie, and Gemini is asked not to store it (store: false).
const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const TEXTURES: Texture[] = ["straight", "wavy", "curly", "coily"]
const DAILY = 15 // renders per Pro account per day (and 30 per IP, the limiter's IP cap)

export async function POST(req: NextRequest) {
  // AI try-on on your own photo is the paid part of /ai-stylist (the try-on on a model is free)
  const user = await getAuthUser(req)
  if (!isPro(user)) {
    return NextResponse.json({ error: "AI try-on on your own photo is part of Ollie Pro.", code: user ? "pro_required" : "signin" }, { status: 402 })
  }
  const ip = getIp(req)
  const tooMany = NextResponse.json({ error: "You've made a lot of previews. Please try again later." }, { status: 429 })
  // Burst guard per instance; the real cap is durable, below.
  if (!checkRateLimit(`render:${ip}`, 3, 60_000)) return tooMany
  const body = await req.json().catch(() => null)
  if (body?.consent !== true) return NextResponse.json({ error: "Tick the box to allow sending your photo." }, { status: 400 })
  const parsed = typeof body.image === "string" && body.image.length <= MAX_IMAGE_BYTES ? body.image.match(/^data:(image\/(?:jpeg|png));base64,(.+)$/) : null
  if (!parsed) return NextResponse.json({ error: "Invalid photo." }, { status: 400 })
  const look: Look = body.look && typeof body.look === "object" ? body.look : {}
  const texture = TEXTURES.includes(body.texture) ? (body.texture as Texture) : undefined
  const built = instruction(look, texture)
  if (!built) return NextResponse.json({ error: "Pick at least one thing to try on." }, { status: 400 })

  const refs = await productPhotos(req.nextUrl.origin, built.refs)
  // Durable daily cap (Gemini costs per render), counted only for valid requests, in the search limiter's table.
  // ponytail: the "render:" prefixes keep these rows apart from searches, so no new table; give renders their own
  // table if the two ever need different retention.
  const quota = await consumeSearch(await guestId(`render:${user!.id}`), `render:${ip}`, DAILY, "24 hours")
  if (!quota.ok) return quota.reason === "unavailable"
    ? NextResponse.json({ error: "Previews are unavailable right now. Please try again soon." }, { status: 503 })
    : tooMany
  try {
    const img = await geminiImage(refs.length ? `${built.text}
${REF_NOTE}` : built.text, [{ mime_type: parsed[1], data: parsed[2] }, ...refs])
    return NextResponse.json({ image: `data:${img.mime_type};base64,${img.data}` })
  } catch (e) {
    console.error("style-render:", e)
    await refundSearch(quota) // a failed render shouldn't use up the day's allowance
    return NextResponse.json({ error: (e as Error).message || "The preview took too long. Please try again." }, { status: 502 })
  }
}
