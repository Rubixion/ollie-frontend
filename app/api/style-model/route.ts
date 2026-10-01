import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getIp } from "@/lib/rate-limit"
import { instruction, type Look } from "@/lib/style/editor"
import { REF_NOTE, geminiImage, productPhotos, publicImage } from "@/lib/gemini"

// Free try-on: the picked real products on a realistic (AI-made, fictional) model, public/style/models/<gender>.jpg.
// Every outfit is generated once and cached in the public Supabase Storage bucket "tryon" (supabase/style_tryon.sql),
// so the cost is capped by the catalogue: (tops+1)(outer+1)(bottoms+1)(shoes+1) outfits per model, ~$0.04 each.
// Bump VERSION after changing a product photo or the prompt so old renders are regenerated.
const VERSION = "v1"
const SLOTS = ["top", "outer", "bottom", "shoes"] as const
const GENDERS = ["male", "female"] as const

const storage = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? { url, key } : null
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const gender = GENDERS.find((g) => g === body?.gender) ?? "male"
  const look: Look = {}
  for (const s of SLOTS) if (typeof body?.look?.[s] === "string") look[s] = body.look[s]
  const built = instruction(look)
  if (!built) return NextResponse.json({ error: "Pick a top, jacket, bottoms or shoes to try on." }, { status: 400 })

  const st = storage()
  if (!st) return NextResponse.json({ error: "Try-on is not configured yet." }, { status: 503 })
  const id = [VERSION, gender, ...SLOTS.map((s) => look[s] ?? "-")].join("_") // only known ids reach here
  const publicUrl = `${st.url}/storage/v1/object/public/tryon/${id}.jpg`

  // cached? (someone already dressed the model in this outfit)
  const head = await fetch(publicUrl, { method: "HEAD" }).catch(() => null)
  if (head?.ok) return NextResponse.json({ url: publicUrl, cached: true })

  const ip = getIp(req)
  // ponytail: per-instance limits; the cache already caps total spend (see top comment)
  if (!checkRateLimit(`model:${ip}`, 4, 60_000) || !checkRateLimit(`model-day:${ip}`, 30, 86_400_000)) {
    return NextResponse.json({ error: "Lots of new outfits from you today. Try one you've already seen, or come back later." }, { status: 429 })
  }

  const origin = req.nextUrl.origin
  const base = await publicImage(origin, `/style/models/${gender}.jpg`)
  if (!base) return NextResponse.json({ error: "Try-on is not configured yet." }, { status: 503 })
  const refs = await productPhotos(origin, built.refs)

  try {
    const img = await geminiImage(refs.length ? `${built.text}\n${REF_NOTE}` : built.text, [base, ...refs])
    const up = await fetch(`${st.url}/storage/v1/object/tryon/${id}.jpg`, {
      method: "POST",
      headers: { Authorization: `Bearer ${st.key}`, apikey: st.key, "Content-Type": "image/jpeg", "x-upsert": "true", "Cache-Control": "max-age=31536000" },
      body: Buffer.from(img.data, "base64"),
    })
    if (!up.ok) {
      console.error("style-model upload:", up.status, (await up.text()).slice(0, 300))
      return NextResponse.json({ url: `data:${img.mime_type};base64,${img.data}`, cached: false }) // still show it
    }
    return NextResponse.json({ url: publicUrl, cached: false })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
