import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthUser } from "@/lib/auth-server"
import { checkRateLimit, getIp } from "@/lib/rate-limit"
import { TERMS_VERSION } from "@/lib/site-config"

// Records what a signed-in user agreed to at signup: the Terms + Privacy Policy (required) and the
// optional email list. Table: supabase/user_consents.sql. Opting in is additive here; unsubscribing
// is a separate step (see the SQL file), so a later call can never silently re-subscribe someone.
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  if (!checkRateLimit(`consent:${getIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  // Ticked in this browser (Google sign-up), or saved on the account at email sign-up (which may be
  // confirmed on another device).
  const meta = user.user_metadata ?? {}
  const terms = body?.terms === true || meta.terms_accepted === true
  const emailOptIn = body?.emailOptIn === true || meta.email_opt_in === true
  if (!terms) return NextResponse.json({ error: "Terms not accepted" }, { status: 400 })
  const termsVersion =
    typeof body?.termsVersion === "string" ? body.termsVersion.slice(0, 20)
    : typeof meta.terms_version === "string" ? meta.terms_version.slice(0, 20)
    : TERMS_VERSION

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: "Not configured" }, { status: 503 })
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: existing, error: readError } = await db
    .from("user_consents")
    .select("terms_accepted_at, email_opt_in, email_opt_in_at, email_opt_out_at")
    .eq("user_id", user.id)
    .maybeSingle()
  if (readError) {
    console.error("consent read failed:", readError.message)
    return NextResponse.json({ error: "Could not save" }, { status: 500 })
  }

  const now = new Date().toISOString()
  const subscribe = emailOptIn && !existing?.email_opt_in && !existing?.email_opt_out_at
  const { error } = await db.from("user_consents").upsert({
    user_id: user.id,
    email: user.email ?? null,
    terms_version: termsVersion,
    terms_accepted_at: existing?.terms_accepted_at ?? now,
    email_opt_in: Boolean(existing?.email_opt_in) || subscribe,
    email_opt_in_at: subscribe ? now : existing?.email_opt_in_at ?? null,
    updated_at: now,
  })
  if (error) {
    console.error("consent save failed:", error.message)
    return NextResponse.json({ error: "Could not save" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
