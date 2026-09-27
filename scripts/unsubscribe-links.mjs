// Prints the mailing list as CSV (email,unsubscribe_url) for your email tool, one row per subscribed address from
// both lists. Put {{unsubscribe_url}} in each email and in its List-Unsubscribe header.
//   node scripts/unsubscribe-links.mjs > mailing-list.csv
// Reads .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and UNSUBSCRIBE_SECRET (same value as the
// Cloudflare secret, or production will reject the links). Keep the CSV private: the links work without a login.
import { createHmac } from "node:crypto"
import { createClient } from "@supabase/supabase-js"

process.loadEnvFile(".env.local")
const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, UNSUBSCRIBE_SECRET: secret } = process.env
if (!url || !key || !secret) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and UNSUBSCRIBE_SECRET in .env.local")
const SITE = "https://www.ollieml.com" // lib/site-config.ts SITE_URL

const db = createClient(url, key, { auth: { persistSession: false } })
const [a, b] = await Promise.all([
  db.from("newsletter_signups").select("email").is("unsubscribed_at", null),
  db.from("user_consents").select("email").eq("email_opt_in", true).is("email_opt_out_at", null).not("email", "is", null),
])
if (a.error || b.error) throw new Error(a.error?.message ?? b.error?.message)

const emails = [...new Set([...a.data, ...b.data].map((r) => r.email.trim().toLowerCase()))].sort()
console.log("email,unsubscribe_url")
for (const e of emails) {
  const t = createHmac("sha256", secret).update(e).digest("hex") // same as lib/unsubscribe.ts
  console.log(`${e},${SITE}/unsubscribe?e=${encodeURIComponent(e)}&t=${t}`)
}
console.error(`${emails.length} subscribed addresses`)
