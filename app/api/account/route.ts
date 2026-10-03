import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthUser } from "@/lib/auth-server"
import { checkRateLimit, getIp } from "@/lib/rate-limit"

// Deletes the signed-in user's account for good. Their consents and saved outfits go with it (on delete cascade);
// their address also comes off the no-account email list. Asked for from /account after typing a confirmation.
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  if (!checkRateLimit(`account-delete:${getIp(req)}`, 5, 60_000)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: "Not configured" }, { status: 503 })
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  if (user.email) await db.from("newsletter_signups").delete().eq("email", user.email.toLowerCase())
  const { error } = await db.auth.admin.deleteUser(user.id)
  if (error) {
    console.error("account delete failed:", error.message)
    return NextResponse.json({ error: "Could not delete the account. Please try again or contact us." }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
