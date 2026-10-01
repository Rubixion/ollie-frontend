import type { User } from "@supabase/supabase-js"

// Who has Ollie Pro (the paid AI try-on).
// ponytail: an email allowlist in STYLE_PRO_EMAILS (comma-separated) for testing. Before taking real payments,
// add Stripe's checkout.session.completed webhook writing the plan to a Supabase table, and read it here.
export function isPro(user: User | null) {
  const list = (process.env.STYLE_PRO_EMAILS ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean)
  return !!user?.email && list.includes(user.email.toLowerCase())
}
