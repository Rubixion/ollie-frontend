// Ollie Pro: the AI try-on on your own photo (the 3D try-on and everything else in /style stays free).
// Stripe price ids come from env (STRIPE_PRICE_MONTHLY / _YEARLY / _LIFETIME); the prices shown here must match them.
export type PlanId = "monthly" | "yearly" | "lifetime"
export type Plan = { id: PlanId; name: string; price: string; period: string; note: string; mode: "subscription" | "payment"; highlighted?: boolean }

export const PLANS: Plan[] = [
  { id: "monthly", name: "Monthly", price: "$6.99", period: "/month", note: "Cancel any time", mode: "subscription" },
  { id: "yearly", name: "Yearly", price: "$39.99", period: "/year", note: "About $3.33 a month, save 52%", mode: "subscription", highlighted: true },
  { id: "lifetime", name: "Lifetime", price: "$79", period: "once", note: "Pay once, keep it forever", mode: "payment" },
]

export const PRO_FEATURES = [
  "AI try-on: haircuts, beards and the real clothes on your own photo",
  "Unlimited previews of every look",
  "Exact product matching from the brands' own photos",
  "Celebrity lookalike finder, matched against 5,000+ stars",
  "Face compare: see how alike any two people are",
  "Barber notes for every cut",
]
