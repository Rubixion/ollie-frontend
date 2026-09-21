import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-server"
import { checkRateLimit, getIp } from "@/lib/rate-limit"
import { USER_LIMIT, consumeSearch, refundSearch } from "@/lib/search-quota"

const MAX_IMAGE_BYTES = 7 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const ip = getIp(req)
    // quick per-minute burst guard (per server instance); the real limits are in consumeSearch below
    if (!checkRateLimit(`search:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 })
    }

    const { image } = await req.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    if (typeof image !== "string" || image.length > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image too large. Max 5 MB." }, { status: 413 })
    }

    const parsed = image.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i)
    if (!parsed) {
      return NextResponse.json({ error: "Invalid image format." }, { status: 400 })
    }

    const baseUrl = process.env.INFERENCE_URL
    const apiKey = process.env.INFERENCE_API_KEY
    if (!baseUrl || !apiKey) {
      console.error("INFERENCE_URL / INFERENCE_API_KEY are not set")
      return NextResponse.json({ error: "Search is not configured yet." }, { status: 503 })
    }

    // Everything above is free; only a valid, ready-to-run search counts against the user's allowance.
    const quota = await consumeSearch(user.id, ip)
    if (!quota.ok) {
      if (quota.reason === "user_limit") {
        return NextResponse.json(
          { error: `You've used all ${USER_LIMIT} of your searches.`, code: "user_limit" },
          { status: 429 }
        )
      }
      if (quota.reason === "ip_limit") {
        return NextResponse.json(
          { error: "Too many searches from your network today. Please try again tomorrow.", code: "ip_limit" },
          { status: 429 }
        )
      }
      return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 503 })
    }

    const form = new FormData()
    const bytes = Uint8Array.from(atob(parsed[2]), (c) => c.charCodeAt(0))
    form.append("file", new Blob([bytes], { type: parsed[1] }), "upload")

    let res: Response
    try {
      res = await fetch(`${baseUrl.replace(/\/$/, "")}/search`, {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          // only needed if the inference server sits behind an auth proxy, e.g. a private Hugging Face Space
          ...(process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {}),
        },
        body: form,
        // a sleeping serverless container needs a while to boot; a warm search takes a few seconds
        signal: AbortSignal.timeout(90_000),
      })
    } catch {
      await refundSearch(quota)
      return NextResponse.json(
        { error: "The search server is waking up. Please try again in a minute." },
        { status: 503 }
      )
    }

    if (!res.ok) {
      console.error("Inference server error:", res.status)
      await refundSearch(quota)
      return NextResponse.json({ error: "Search failed. Please try again." }, { status: 502 })
    }

    const result = await res.json()
    // remaining: null = unlimited (exempt account)
    const remaining = quota.used === null ? null : Math.max(0, USER_LIMIT - quota.used)
    return NextResponse.json({ ...result, remaining })
  } catch (err) {
    console.error("Search API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
