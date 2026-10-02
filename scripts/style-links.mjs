// Checks every product link in the style catalogue still opens. Run: npx tsx scripts/style-links.mjs
// Some brand sites block scripts (403/429) even when the page is fine: those are listed as "blocked", check them by hand.
import { ITEMS } from "../lib/style/catalog.ts"

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
const res = await Promise.all(ITEMS.map(async (i) => {
  try {
    const r = await fetch(i.url, { headers: { "User-Agent": UA, Accept: "text/html" }, redirect: "follow", signal: AbortSignal.timeout(20_000) })
    // a product page that redirects to a search, home or category page usually means it's gone
    const moved = new URL(r.url).pathname.length < 3 || /\/(search|404|not-found)/i.test(r.url)
    return { id: i.id, status: r.ok && !moved ? "ok" : [401, 403, 429].includes(r.status) ? "blocked" : "BROKEN", code: r.status, url: r.url }
  } catch (e) {
    return { id: i.id, status: "BROKEN", code: e.name, url: i.url }
  }
}))
for (const r of res.sort((a, b) => a.status.localeCompare(b.status))) console.log(r.status.padEnd(8), String(r.code).padEnd(4), r.id.padEnd(28), r.url)
const n = {}
for (const r of res) n[r.status] = (n[r.status] ?? 0) + 1
console.log(n)
