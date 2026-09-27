import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { checkRateLimit, getIp } from "@/lib/rate-limit"
import { validUnsubscribe } from "@/lib/unsubscribe"

// Takes an address off both email lists: newsletter_signups (the no-account form) and user_consents (the signup box).
// Called by the /unsubscribe page (JSON body) and by mail apps' one-click unsubscribe (RFC 8058: a POST to the
// List-Unsubscribe URL, ?e=&t= in the query). Nothing happens on GET, so link scanners can't unsubscribe anyone.
export async function POST(req: NextRequest) {
  if (!checkRateLimit(`unsubscribe:${getIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  const q = req.nextUrl.searchParams
  const body = req.headers.get("content-type")?.includes("application/json") ? await req.json().catch(() => ({})) : {}
  const email = String(body?.email ?? q.get("e") ?? "").trim().toLowerCase()
  const token = String(body?.token ?? q.get("t") ?? "")
  if (!validUnsubscribe(email, token)) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: "Not configured" }, { status: 503 })
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const now = new Date().toISOString()
  const [a, b] = await Promise.all([
    db.from("newsletter_signups").update({ unsubscribed_at: now }).eq("email", email).is("unsubscribed_at", null),
    db.from("user_consents").update({ email_opt_in: false, email_opt_out_at: now, updated_at: now }).eq("email", email),
  ])
  if (a.error || b.error) {
    console.error("unsubscribe failed:", a.error?.message ?? b.error?.message)
    return NextResponse.json({ error: "Could not save" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
