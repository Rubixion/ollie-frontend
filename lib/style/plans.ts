// Ollie Pro: the AI try-on on your own photo (the model, the scan and the picks stay free).
// Stripe price ids come from env (STRIPE_PRICE_MONTHLY / _YEARLY / _LIFETIME). Give each Stripe Price `currency_options`
// for every currency below, with the same amounts, so Checkout charges what this popup shows.
export type PlanId = "monthly" | "yearly" | "lifetime"
export type Currency = "USD" | "CAD" | "GBP" | "EUR" | "AUD"
export type Plan = { id: PlanId; name: string; mode: "subscription" | "payment"; highlighted?: boolean }

export const PLANS: Plan[] = [
  { id: "monthly", name: "Monthly", mode: "subscription" },
  { id: "yearly", name: "Yearly", mode: "subscription", highlighted: true },
  { id: "lifetime", name: "Lifetime", mode: "payment" },
]

// Rounded to local "charm" prices rather than converted to the cent.
export const PRICES: Record<Currency, Record<PlanId, number>> = {
  USD: { monthly: 6.99, yearly: 39.99, lifetime: 79 },
  CAD: { monthly: 9.49, yearly: 54.99, lifetime: 109 },
  GBP: { monthly: 5.99, yearly: 34.99, lifetime: 69 },
  EUR: { monthly: 6.99, yearly: 39.99, lifetime: 79 },
  AUD: { monthly: 10.99, yearly: 59.99, lifetime: 119 },
}

const EURO = "AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK".split(" ")
/** Currency for a two-letter country code (Cloudflare's cf-ipcountry); US dollars when unknown. */
export function currencyFor(country?: string | null): Currency {
  const c = (country ?? "").toUpperCase()
  return c === "CA" ? "CAD" : c === "GB" ? "GBP" : c === "AU" ? "AUD" : EURO.includes(c) ? "EUR" : "USD"
}

export const money = (n: number, cur: Currency) =>
  new Intl.NumberFormat("en", { style: "currency", currency: cur, currencyDisplay: "narrowSymbol", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n)

/** What each plan card shows. Yearly leads with its per-month price; monthly shows what a year of it costs, so
 *  yearly reads as the obvious deal (the anchor), and lifetime sits above both as the "large" option. */
export function priceLines(id: PlanId, cur: Currency) {
  const p = PRICES[cur]
  if (id === "monthly") return { big: money(p.monthly, cur), per: "/month", note: `${money(Math.round(p.monthly * 12 * 100) / 100, cur)} a year` }
  if (id === "yearly") {
    const save = Math.round((1 - p.yearly / (p.monthly * 12)) * 100)
    return { big: money(Math.floor((p.yearly / 12) * 100) / 100, cur), per: "/month", note: `Billed ${money(p.yearly, cur)} yearly · save ${save}%` }
  }
  return { big: money(p.lifetime, cur), per: "once", note: "Pay once, keep it forever" }
}

export const FREE_FEATURES = [
  "Dress a realistic model in real clothes",
  "Choose for me: outfits picked for your look and height",
  "Face shape scan with haircuts, beards and glasses that suit it",
  "Shop links for every piece",
]

// Sell the outcome first, then what's in it.
export const PRO_PROMISE = "Know it suits you before you cut, buy or book."
export const PRO_FEATURES = [
  "Every haircut and outfit tried on your own photo",
  "Brow shapes matched to your face",
  "Unlimited Choose for me",
  "Celebrity lookalike finder, matched against 5,000+ stars",
  "Face compare: see how alike any two people are",
]
