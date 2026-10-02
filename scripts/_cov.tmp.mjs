import sharp from "sharp"; import fs from "node:fs"
import { ITEMS } from "../lib/style/catalog.ts"
const slot = Object.fromEntries(ITEMS.map((i) => [i.id, i.slot])), rows = []
for (const b of fs.readdirSync("public/style/layers").filter((d) => !d.includes(".")))
  for (const f of fs.readdirSync(`public/style/layers/${b}`).filter((f) => f.endsWith(".webp") && !f.includes(".clip"))) {
    const { data } = await sharp(`public/style/layers/${b}/${f}`).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true })
    let n = 0; for (const v of data) if (v > 128) n++
    rows.push({ b, f, s: slot[f.replace(/(@hood)?\.webp$/, "")], c: n / data.length })
  }
for (const s of ["shoes", "bottom", "top", "outer"]) {
  const c = rows.filter((r) => r.s === s).map((r) => r.c).sort((a, b) => a - b)
  console.log(s, "median", (c[c.length >> 1] * 100).toFixed(1), "max", (c.at(-1) * 100).toFixed(1))
  // outliers: over 1.8x the slot's median
  for (const r of rows.filter((r) => r.s === s && r.c > 1.8 * c[c.length >> 1])) console.log("  OUTLIER", r.b, r.f, (r.c * 100).toFixed(1))
}
