import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-server"
import { isPro } from "@/lib/pro"
import { PLANS } from "@/lib/style/plans"

// GET: does the signed-in user have Pro?  POST {plan}: a Stripe Checkout link for that plan.
export async function GET(req: NextRequest) {
  return NextResponse.json({ pro: isPro(await getAuthUser(req)) })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Sign in first.", code: "signin" }, { status: 401 })
  const { plan: id } = await req.json().catch(() => ({}))
  const plan = PLANS.find((p) => p.id === id)
  if (!plan) return NextResponse.json({ error: "Unknown plan." }, { status: 400 })

  const key = process.env.STRIPE_SECRET_KEY
  const price = process.env[`STRIPE_PRICE_${plan.id.toUpperCase()}`]
  if (!key || !price) return NextResponse.json({ error: "Payments open soon. Check back in a few days." }, { status: 503 })

  const origin = req.nextUrl.origin
  const form = new URLSearchParams({
    mode: plan.mode,
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    success_url: `${origin}/style?pro=thanks`,
    cancel_url: `${origin}/style`,
    client_reference_id: user.id, // the webhook (still to add, see lib/pro.ts) uses this to unlock the account
    "metadata[plan]": plan.id,
    ...(user.email ? { customer_email: user.email } : {}),
  })
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  })
  const d = await res.json().catch(() => ({}))
  if (!res.ok || !d.url) {
    console.error("stripe checkout:", res.status, d?.error?.message)
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 502 })
  }
  return NextResponse.json({ url: d.url })
}
