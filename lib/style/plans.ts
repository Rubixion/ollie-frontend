// Ollie Pro: the AI try-on on your own photo (the try-on on a model and everything else in /style stays free).
// Stripe price ids come from env (STRIPE_PRICE_MONTHLY / _YEARLY / _LIFETIME); the prices shown here must match them.
export type PlanId = "monthly" | "yearly" | "lifetime"
export type Plan = { id: PlanId; name: string; price: string; period: string; note: string; mode: "subscription" | "payment"; highlighted?: boolean }

export const PLANS: Plan[] = [
  { id: "monthly", name: "Monthly", price: "$6.99", period: "/month", note: "Cancel any time", mode: "subscription" },
  { id: "yearly", name: "Yearly", price: "$39.99", period: "/year", note: "About $3.33 a month, save 52%", mode: "subscription", highlighted: true },
  { id: "lifetime", name: "Lifetime", price: "$79", period: "once", note: "Pay once, keep it forever", mode: "payment" },
]

export const FREE_FEATURES = [
  "Face shape scan",
  "Haircuts, beards and glasses picked for your face",
  "Real clothes tried on a realistic model",
  "Shop links for every piece",
]

export const PRO_FEATURES = [
  "Everything in Free",
  "Try every haircut and real outfit on your own photo",
  "Unlimited previews of every look",
  "Celebrity lookalike finder, matched against 5,000+ stars",
  "Face compare: see how alike any two people are",
]
