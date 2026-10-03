// Real colourways for catalogue items, from the brand's own data, for `colors` in lib/style/catalog.ts.
// Uniqlo: its product API lists every colour sold now, with a colour-chip photo; the hex is the chip's median colour.
// Usage (from ollie-frontend): npx tsx scripts/style-colors.mjs   -> prints the colors arrays to paste in.
// ponytail: Uniqlo only. Other brands block scripts; their colours are entered by hand from the product page.
import sharp from "sharp"
import { ITEMS } from "../lib/style/catalog.ts"

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
const title = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

async function chipHex(url) {
  const buf = Buffer.from(await (await fetch(url, { headers: { "User-Agent": UA } })).arrayBuffer())
  // the middle of the chip: the fabric, away from any border
  const { data } = await sharp(buf).resize(40, 40).extract({ left: 10, top: 10, width: 20, height: 20 }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const ch = [0, 1, 2].map((k) => { const v = []; for (let i = k; i < data.length; i += 3) v.push(data[i]); v.sort((a, b) => a - b); return v[v.length >> 1] })
  return "#" + ch.map((v) => v.toString(16).padStart(2, "0")).join("")
}

for (const it of ITEMS.filter((i) => /uniqlo\.com/.test(i.url))) {
  const code = it.url.match(/E\d{6}-\d{3}/)?.[0]
  if (!code) continue
  const res = await fetch(`https://www.uniqlo.com/us/api/commerce/v5/en/products/${code}/price-groups/00/details?includeModelSize=false&httpFailure=true`,
    { headers: { "User-Agent": UA, "x-fr-clientid": "uq.us.web-spa" } })
  const r = (await res.json().catch(() => ({})))?.result
  if (!r?.colors?.length) { console.log(`// ${it.id}: no colour data (${res.status})`); continue }
  const names = r.colors.map((c) => title(c.name))
  const out = []
  for (const c of r.colors) {
    const chip = r.images?.chip?.[c.displayCode]
    if (!chip) continue
    const name = title(c.name), dup = names.filter((n) => n === name).length > 1
    out.push({ name: dup ? `${name} ${c.displayCode}` : name, hex: await chipHex(chip) })
  }
  console.log(`// ${it.id} (${r.name}, ${code}): ${out.length} colours`)
  console.log(`colors: ${JSON.stringify(out)},`)
}
