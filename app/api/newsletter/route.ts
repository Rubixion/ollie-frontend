import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { checkRateLimit, getIp } from "@/lib/rate-limit"
import { NEWSLETTER_CONSENT } from "@/lib/newsletter"

// Mailing-list signup without an account (components/ui/newsletter-form.tsx). Table: supabase/newsletter_signups.sql.
// Signing up again re-subscribes: it's a fresh, explicit consent.
export async function POST(req: NextRequest) {
  if (!checkRateLimit(`newsletter:${getIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
  }
  if (body?.consent !== true) return NextResponse.json({ error: "Consent missing" }, { status: 400 })
  const source = ["search", "blog"].includes(body?.source) ? body.source : "search" // which form, for the list's records

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: "Not configured" }, { status: 503 })
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { error } = await db.from("newsletter_signups").upsert({
    email,
    source,
    consent_text: NEWSLETTER_CONSENT,
    subscribed_at: new Date().toISOString(),
    unsubscribed_at: null,
  })
  if (error) {
    console.error("newsletter save failed:", error.message)
    return NextResponse.json({ error: "Could not save" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
