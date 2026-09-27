import { createHmac, timingSafeEqual } from "node:crypto"
import { SITE_URL } from "@/lib/site-config"

// Unsubscribe links carry a signature of the email address, so nobody can unsubscribe someone else by guessing.
// UNSUBSCRIBE_SECRET must be the same wherever links are made (scripts/unsubscribe-links.mjs, run with .env.local)
// and where they're checked (the Cloudflare Worker secret). Server-only.
function sign(email: string, secret: string) {
  return createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex")
}

export function unsubscribeUrl(email: string, secret = process.env.UNSUBSCRIBE_SECRET ?? "") {
  const e = email.trim().toLowerCase()
  return `${SITE_URL}/unsubscribe?e=${encodeURIComponent(e)}&t=${sign(e, secret)}`
}

export function validUnsubscribe(email: string, token: string) {
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (!secret || !email || !/^[0-9a-f]{64}$/.test(token)) return false
  return timingSafeEqual(Buffer.from(sign(email, secret), "hex"), Buffer.from(token, "hex"))
}
