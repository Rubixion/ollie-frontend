import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getIp } from "@/lib/rate-limit"

// Hidden /style page: one camera frame -> apparent age + gender from the inference server.
// Not counted against the search quota; the frame is forwarded in memory and never stored.
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export async function POST(req: NextRequest) {
  // ponytail: per-instance burst guard only; move to the search-quota table if /style goes public
  if (!checkRateLimit(`style:${getIp(req)}`, 6, 60_000)) {
    return NextResponse.json({ error: "Too many scans. Please wait a moment." }, { status: 429 })
  }
  const { image } = await req.json().catch(() => ({}))
  const parsed = typeof image === "string" && image.length <= MAX_IMAGE_BYTES ? image.match(/^data:(image\/jpeg);base64,(.+)$/) : null
  if (!parsed) return NextResponse.json({ error: "Invalid frame." }, { status: 400 })

  const baseUrl = process.env.INFERENCE_URL
  const apiKey = process.env.INFERENCE_API_KEY
  if (!baseUrl || !apiKey) return NextResponse.json({ error: "Scan is not configured yet." }, { status: 503 })

  const form = new FormData()
  form.append("file", new Blob([Uint8Array.from(atob(parsed[2]), (c) => c.charCodeAt(0))], { type: parsed[1] }), "frame.jpg")
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/style-scan`, {
      method: "POST",
      headers: { "X-Api-Key": apiKey, ...(process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {}) },
      body: form,
      signal: AbortSignal.timeout(90_000),
    })
    if (!res.ok) return NextResponse.json({ error: "Age estimate failed." }, { status: 502 })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: "The scan server is waking up. Please try again in a minute." }, { status: 503 })
  }
}
