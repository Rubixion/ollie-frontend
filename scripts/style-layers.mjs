// Clothes layers for the /ai-stylist model: each catalogue item is rendered ONCE per gender on the bare base model and cut
// out as a see-through layer, so any outfit is just stacked layers in the browser (no image cost per outfit).
// A "body" is gender + build (male-athletic, female-plus, ...), see scripts/style-bases.mjs.
// Usage (from ollie-frontend): npx tsx scripts/style-layers.mjs [body|gender ...] [itemId ...] [--clean]
// --clean re-cleans existing layers (drops leaked skin, hair and backdrop) with no image calls, using style-parse.py labels.
// Writes public/style/layers/<body>/<id>.webp (+ <id>@hood.webp and <id>.clip.webp for jackets) and
// public/style/layers/index.json. Work files are cached in .style-cache/<body>/ so re-runs don't pay twice.
// Each item = 2 image calls: (1) put the item on the base model, (2) paint everything except the item pure green.
// Jackets get one more pair, drawn over the hoodie, so a hood sits naturally over the collar.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs"
import { execFileSync } from "node:child_process"
import sharp from "sharp"
sharp.cache(false) // libvips otherwise keeps files open, and Windows then can't replace them
import { generateImage, scriptEnv } from "../lib/image-gen.mjs"
import { ITEMS as CATALOG } from "../lib/style/catalog.ts"

const env = await scriptEnv()
const NOUN = { top: "top", outer: "outer layer (jacket, coat or vest)", bottom: "trousers", shoes: "pair of shoes (and any socks showing above them)" }
// Items with `shape` reuse another item's layer, so there's nothing to render for them. A colour with its own `layer`
// (rendered in that colour) is rendered like an item: its render text is the item's, with the colour swapped in.
const COLOR_LAYERS = CATALOG.flatMap((i) => (i.colors ?? []).filter((c) => c.layer).map((c) => ({ ...i, id: c.layer, render: i.render.replace(new RegExp((i.colors.find((x) => x.drawn) ?? i.colors[0]).name, "i"), c.name.toLowerCase()) })))
const ITEMS = Object.fromEntries([...CATALOG.filter((i) => !i.shape), ...COLOR_LAYERS].map((i) => [i.id, {
  slot: i.slot, noun: NOUN[i.slot], hood: /hoodie/i.test(i.name), for: i.for,
  what: i.slot === "outer" ? `${i.render}, worn open` : i.render, tucked: /tucked into/.test(i.render),
}]))
const TEE = "uniqlo-u-tee" // jackets are drawn over this, so their sleeves are wide enough to cover a t-shirt's
const HOODIE = Object.keys(ITEMS).find((k) => ITEMS[k].hood)

async function gemini(text, image) {
  const img = await generateImage({ text, images: [{ mime_type: "image/jpeg", data: image.toString("base64") }], env, timeoutMs: 600_000 })
  return sharp(Buffer.from(img.data, "base64")).jpeg({ quality: 95 }).toBuffer()
}


// For a jacket: a mask that is opaque only between the jacket's left and right edges on each row. Tops under the
// jacket are clipped to it, so a sleeve that's a little wider than the jacket's never pokes out at the sides.
async function clipMask(layerPng, w, h) {
  const { data } = await sharp(layerPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const spans = []
  for (let y = 0; y < h; y++) {
    let x0 = -1, x1 = -1
    for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 128) { if (x0 < 0) x0 = x; x1 = x }
    spans.push([x0, x1])
  }
  // only trim the sides from the shoulders down: above that (neck, collar, hood) the top shows in full
  const widest = Math.max(...spans.map(([a, b]) => b - a))
  const shoulders = spans.findIndex(([a, b]) => a >= 0 && b - a > 0.85 * widest)
  const out = Buffer.alloc(w * h * 4) // transparent
  for (let y = 0; y < h; y++) {
    const [x0, x1] = spans[y]
    const from = y < shoulders || x0 < 0 ? 0 : x0, to = y < shoulders || x0 < 0 ? w - 1 : x1
    for (let x = from; x <= to; x++) out[(y * w + x) * 4 + 3] = 255
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 88, alphaQuality: 90 }).toBuffer()
}
const raw = (buf, w, h) => sharp(buf).resize(w, h, { fit: "fill" }).removeAlpha().raw().toBuffer()

// Gemini's cut-out sometimes keeps bits of the base model: neck skin, a shoulder, even the whole backdrop. Those are the
// WHITE base's pixels, so on a darker look they showed as pale patches (and kept backdrop clips bigger hair). Clean-up:
// - skin and hair (and, on tops and jackets, trousers and shoes): wherever the human parser (scripts/style-parse.py -> <name>-labels.png) sees face/neck, arms, legs or
//   hair, grown 2px. The leaked skin is redrawn by Gemini, so it can't be found by comparing with the base.
// - backdrop: pixels unchanged from the bare base (they and most of their neighbourhood) connected to the frame's top
//   or sides, and called background by the parser. Garments never touch those edges.
const SKIN_LABELS = new Set([2, 11, 12, 13, 14, 15])
const LOWER_LABELS = new Set([5, 6, 9, 10]) // skirt, trousers, shoes: a top or jacket cut-out sometimes keeps the base's grey trousers
async function cleanLayer(layer, bare, labels, w, h, slot, baseSkin) {
  const L = await sharp(layer).ensureAlpha().raw().toBuffer()
  const same = Buffer.alloc(w * h)
  for (let p = 0; p < w * h; p++) {
    const d = Math.abs(L[p * 4] - bare[p * 3]) + Math.abs(L[p * 4 + 1] - bare[p * 3 + 1]) + Math.abs(L[p * 4 + 2] - bare[p * 3 + 2])
    same[p] = L[p * 4 + 3] > 0 && d < 30 ? 255 : 0
  }
  const share = await sharp(same, { raw: { width: w, height: h, channels: 1 } }).blur(2.5).extractChannel(0).raw().toBuffer()
  const drop = new Uint8Array(w * h)
  const bg = new Uint8Array(w * h), stack = []
  for (let x = 0; x < w; x++) stack.push(x)
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1)
  while (stack.length) {
    const p = stack.pop()
    if (bg[p] || (L[p * 4 + 3] > 0 && !(same[p] && share[p] > 150))) continue // spread through unchanged and transparent pixels
    bg[p] = 1
    drop[p] = !labels || labels[p] === 0 ? 1 : 0 // a beige garment can match a beige backdrop: never drop what the parser calls clothing
    const x = p % w
    if (x > 0) stack.push(p - 1); if (x < w - 1) stack.push(p + 1); if (p >= w) stack.push(p - w); if (p < w * h - w) stack.push(p + w)
  }
  if (labels) {
    const upper = slot === "top" || slot === "outer"
    const skin = Uint8Array.from(labels, (v) => (SKIN_LABELS.has(v) || (upper && LOWER_LABELS.has(v)) ? 1 : 0)) // not Buffer: its slice() is a view, not a copy
    for (let pass = 0; pass < 2; pass++) {
      const prev = skin.slice()
      for (let p = w; p < w * h - w; p++) if (!prev[p] && (prev[p - 1] || prev[p + 1] || prev[p - w] || prev[p + w])) skin[p] = 1
    }
    for (let p = 0; p < w * h; p++) if (skin[p]) drop[p] = 1
  }
  let n = 0
  for (let p = 0; p < w * h; p++) if (drop[p] && L[p * 4 + 3]) { L[p * 4 + 3] = 0; n++ }
  // Trousers: the dressed photo's hands sat a few px off the base's, so dropping them left hand-shaped notches that
  // showed the base's grey chinos. Where a notch lies over the base's trousers (not its skin, not backdrop), grow the
  // trousers into it in their own edge colour. The editor draws the base's hands on top (hands.webp).
  if (labels && baseSkin && slot === "bottom") {
    const fill = Uint8Array.from(labels, (v) => (v === 14 || v === 15 ? 1 : 0))
    for (let pass = 0; pass < 4; pass++) {
      const prev = fill.slice()
      for (let p = w; p < w * h - w; p++) if (!prev[p] && (prev[p - 1] || prev[p + 1] || prev[p - w] || prev[p + w])) fill[p] = 1
    }
    for (let p = 0; p < w * h; p++) {
      const i = p * 3, e = (p - (p % w) + ((p % w) < w / 2 ? 4 : w - 5)) * 3 // backdrop sample, nearest side
      const backdrop = Math.abs(bare[i] - bare[e]) + Math.abs(bare[i + 1] - bare[e + 1]) + Math.abs(bare[i + 2] - bare[e + 2]) < 40
      if (backdrop || baseSkin[p] > 128) fill[p] = 0
    }
    for (let pass = 0; pass < 30; pass++) {
      const solid = Uint8Array.from({ length: w * h }, (_, p) => (L[p * 4 + 3] > 128 ? 1 : 0))
      for (let p = w; p < w * h - w; p++) {
        if (!fill[p] || solid[p]) continue
        const q = solid[p - 1] ? p - 1 : solid[p + 1] ? p + 1 : solid[p - w] ? p - w : solid[p + w] ? p + w : -1
        if (q >= 0) { L.copy(L, p * 4, q * 4, q * 4 + 3); L[p * 4 + 3] = 255; n++ }
      }
    }
  }
  return { n, buf: await sharp(L, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 88, alphaQuality: 90 }).toBuffer() }
}
// A tucked top ends at the bare base's waistband, a few px above where some trousers' layers start, so a sliver of
// the base showed between them. Extend each column's bottom edge 8px down in its own colour: it tucks under any waistband.
async function extendTucked(layer, w, h) {
  const L = await sharp(layer).ensureAlpha().raw().toBuffer()
  const bottom = (x) => { let y = h - 1; while (y >= 0 && L[(y * w + x) * 4 + 3] < 128) y--; return y }
  const hem = bottom(w >> 1)
  for (let x = 0; x < w; x++) {
    const y = bottom(x)
    if (y < 0 || Math.abs(y - hem) > 20) continue // only the hem: a sleeve's column ends at the cuff, lower down by the hand
    for (let k = 1; k <= 8 && y + k < h; k++) L.copy(L, ((y + k) * w + x) * 4, (y * w + x) * 4, (y * w + x) * 4 + 4)
  }
  return sharp(L, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 88, alphaQuality: 90 }).toBuffer()
}
const labelsFor = async (CACHE, name, w, h) => existsSync(`${CACHE}/${name}-labels.png`)
  ? sharp(`${CACHE}/${name}-labels.png`).resize(w, h, { fit: "fill", kernel: "nearest" }).extractChannel(0).raw().toBuffer() : null

// backdrop = bright, saturated green; dark greenish pixels are a black garment with green spill, so they stay opaque
const greenAlpha = (r, g, b) => { const k = g - Math.max(r, b); return g < 120 || k < 30 ? 255 : k > 90 ? 0 : Math.round(255 * (90 - k) / 60) }

// Layer = the dressed photo's own pixels (aligned with the base), masked by Gemini's green-screen cut-out.
// Gemini sometimes re-frames the cut-out like a product shot. Then the garment pixels in the cut-out no longer match
// the dressed photo at the same spots, so it returns null and the caller asks again.
async function cutout(green, dressed, w, h, skin, slot) {
  const d = await raw(dressed, w, h), g = await raw(green, w, h)
  const alpha = new Uint8Array(w * h)
  let n = 0, diff = 0
  for (let p = 0; p < w * h; p++) {
    const i = p * 3
    alpha[p] = greenAlpha(g[i], g[i + 1], g[i + 2])
    if (alpha[p] === 255) { n++; diff += Math.abs(g[i] - d[i]) + Math.abs(g[i + 1] - d[i + 1]) + Math.abs(g[i + 2] - d[i + 2]) }
  }
  const err = n ? diff / n / 3 : 255 // mean per-channel difference inside the garment
  if (err > 30) { console.log(`  cut-out doesn't line up (mean diff ${err.toFixed(0)})`); return null }
  // Gemini sometimes keeps the whole person instead of just the garment. It lines up perfectly, so check the size:
  // shoes are ~1% of the frame, other garments ~10% (up to ~27% for a hoodie on a Plus body).
  const MAX = { shoes: 0.04, bottom: 0.2, top: 0.35, outer: 0.35 }
  if (n / (w * h) > MAX[slot]) { console.log(`  cut-out kept too much (${(100 * n / (w * h)).toFixed(0)}% of the frame)`); return null }
  // trim 2px off every edge (the border can carry a sliver of the base model's skin), then grow 6px copying the
  // garment's own edge colours outward: net ~4px bigger, so it covers the base body where a look's shoulders or
  // hips sit a few pixels wider than in the dressed photo
  const solid = alpha.map((v) => (v === 255 ? 1 : 0))
  for (let pass = 0; pass < 2; pass++) {
    const prev = solid.slice()
    for (let p = w; p < w * h - w; p++) if (prev[p] && !(prev[p - 1] && prev[p + 1] && prev[p - w] && prev[p + w])) solid[p] = 0
  }
  const col = Buffer.from(d)
  for (let pass = 0; pass < 6; pass++) {
    const prev = solid.slice()
    for (let p = w; p < w * h - w; p++) {
      if (prev[p]) continue
      const q = prev[p - 1] ? p - 1 : prev[p + 1] ? p + 1 : prev[p - w] ? p - w : prev[p + w] ? p + w : -1
      if (q < 0) continue
      solid[p] = 1
      col[p * 3] = col[q * 3]; col[p * 3 + 1] = col[q * 3 + 1]; col[p * 3 + 2] = col[q * 3 + 2]
    }
  }
  // Tops and jackets: dressing often draws the shoulder line a little lower than the bare body's, so the base's
  // shoulders would show above the garment. Above the garment's top edge in each column (up to 24px), where the base
  // has skin (its skin mask) and the dressed photo shows backdrop, carry that backdrop in the layer. Only above the
  // garment, so arms that moved a little at the sides are left alone.
  if (skin && (slot === "top" || slot === "outer")) {
    for (let x = 0; x < w; x++) {
      let top = -1
      for (let y = 0; y < h; y++) if (solid[y * w + x]) { top = y; break }
      if (top < 0) continue
      for (let y = Math.max(0, top - 24); y < top; y++) {
        const p = y * w + x, i = p * 3, e = (y * w + (x < w / 2 ? 4 : w - 5)) * 3 // backdrop sample, nearest edge
        const backdrop = Math.abs(d[i] - d[e]) + Math.abs(d[i + 1] - d[e + 1]) + Math.abs(d[i + 2] - d[e + 2]) < 40
        if (skin[p] > 128 && backdrop) solid[p] = 1 // col[p] is already the dressed (backdrop) pixel
      }
    }
  }
  // soft, anti-aliased edge
  const soft = await sharp(Buffer.from(solid.map((v) => v * 255)), { raw: { width: w, height: h, channels: 1 } }).blur(0.8).extractChannel(0).raw().toBuffer()
  const out = Buffer.alloc(w * h * 4)
  for (let p = 0; p < w * h; p++) {
    out[p * 4] = col[p * 3]; out[p * 4 + 1] = col[p * 3 + 1]; out[p * 4 + 2] = col[p * 3 + 2]; out[p * 4 + 3] = soft[p]
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 88, alphaQuality: 90 }).toBuffer()
}

async function makeLayer(OUT, CACHE, W, H, name, it, start, under = "", skin = null, bare = null) {
  if (existsSync(`${OUT}/${name}.webp`)) return console.log(`skip ${name} (layer exists)`)
  const cached = (f) => existsSync(`${CACHE}/${name}-${f}.jpg`) ? readFileSync(`${CACHE}/${name}-${f}.jpg`) : null
  console.log(`${OUT.split("/").pop()} ${name}: dressing…`)
  const dressed = cached("dressed") ?? await gemini(
    `Edit this photo: the model now wears ${it.what}${under}. Change ONLY that garment. Keep everything else exactly identical: ` +
    `the same person, face, hair, body, pose, arm and leg positions, framing, camera angle, scale, background, lighting and all other clothes. ` +
    `The garment must fit naturally with realistic folds and shading.`, start)
  writeFileSync(`${CACHE}/${name}-dressed.jpg`, dressed)
  let layer = null
  for (let attempt = 0; attempt < 3 && !layer; attempt++) {
    console.log(`${OUT.split("/").pop()} ${name}: cutting out…`)
    const green = (attempt === 0 && cached("green")) || await gemini(
      `Keep ONLY the ${it.noun} in this photo, with every pixel of it exactly where it is now, same size and position. ` +
      `Replace absolutely everything else with flat pure green (#00FF00): the background, the floor, the face, hair, skin, hands and all other clothing` +
      `${under ? " including the top underneath" : ""}. Where the body is hidden inside the garment (neck opening, sleeve openings, inside of an open jacket), ` +
      `that area must also be pure green. No shadows on the green.` +
      (attempt ? " IMPORTANT: do NOT zoom, crop, re-center or re-draw the garment. The output must have exactly the same framing as the input, " +
        "so it lines up pixel for pixel when laid on top of the original photo." : ""),
      dressed)
    writeFileSync(`${CACHE}/${name}-green.jpg`, green)
    layer = await cutout(green, dressed, W, H, skin, it.slot)
  }
  if (!layer) throw new Error(`${name}: the cut-out kept coming back re-framed`)
  execFileSync("python", ["scripts/style-parse.py", `${CACHE}/${name}-dressed.jpg`], { stdio: "inherit" }) // skin/hair labels for cleanLayer
  layer = (await cleanLayer(layer, bare, await labelsFor(CACHE, name, W, H), W, H, it.slot, skin)).buf
  if (it.tucked) layer = await extendTucked(layer, W, H)
  writeFileSync(`${OUT}/${name}.webp`, layer)
  if (it.slot === "outer") writeFileSync(`${OUT}/${name}.clip.webp`, await clipMask(layer, W, H))
  console.log(`${OUT.split("/").pop()} ${name}: layer saved`)
}

// The base's hands, drawn over every outfit in the editor (the model photo again, masked by this), so hands always sit
// in front of trousers and hems. = the body's skin below the chest that no top or jacket layer ever covers.
async function handsMask(OUT, skin, W, H) {
  if (!skin) return
  const keep = Uint8Array.from(skin, (v, p) => (v > 128 && p >= W * Math.round(H * 0.4) ? 1 : 0))
  for (const f of readdirSync(OUT).filter((f) => f.endsWith(".webp") && !f.endsWith(".clip.webp"))) {
    if (!["top", "outer"].includes(ITEMS[f.slice(0, -5).replace(/@hood$/, "")]?.slot)) continue
    const a = await sharp(`${OUT}/${f}`).ensureAlpha().extractChannel(3).raw().toBuffer()
    for (let p = 0; p < W * H; p++) if (a[p] > 128) keep[p] = 0
  }
  const alpha = await sharp(Buffer.from(keep.map((v) => v * 255)), { raw: { width: W, height: H, channels: 1 } }).blur(0.8).raw().toBuffer()
  const out = Buffer.alloc(W * H * 4, 255)
  for (let p = 0; p < W * H; p++) out[p * 4 + 3] = alpha[p]
  writeFileSync(`${OUT}/hands.webp`, await sharp(out, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 80, alphaQuality: 90 }).toBuffer())
}

const BODIES = ["male", "female"].flatMap((g) => ["slim", "average", "athletic", "plus"].map((b) => `${g}-${b}`))
const CLEAN = process.argv.includes("--clean") // re-clean existing layers (cleanLayer + clip masks), no image calls
const args = process.argv.slice(2).filter((a) => a !== "--clean")
const pick = args.filter((a) => !ITEMS[a])
const bodies = BODIES.filter((b) => !pick.length || pick.some((a) => b === a || b.startsWith(`${a}-`)))
  .filter((b) => existsSync(`public/style/models/${b}-bare.jpg`))
const only = args.filter((a) => ITEMS[a])
for (const b of bodies) {
  const BASE = `public/style/models/${b}-bare.jpg` // no top, so any neckline shows skin, not the base model's own t-shirt
  const OUT = `public/style/layers/${b}`, CACHE = `.style-cache/${b}`
  mkdirSync(OUT, { recursive: true }); mkdirSync(CACHE, { recursive: true })
  const base = readFileSync(BASE)
  const { width: W, height: H } = await sharp(base).metadata()
  // the body's skin mask from scripts/style-bases.mjs, used to keep its shoulders from showing above tops
  const skin = existsSync(`${CACHE}/skin.png`) ? await sharp(`${CACHE}/skin.png`).resize(W, H, { fit: "fill" }).extractChannel(0).raw().toBuffer() : null
  const bare = await raw(base, W, H)
  if (CLEAN) {
    for (const f of readdirSync(OUT).filter((f) => f.endsWith(".webp") && !f.endsWith(".clip.webp"))) {
      const name = f.slice(0, -5)
      if (name === "hands") continue
      if (only.length && !only.includes(name.replace(/@hood$/, ""))) continue
      const { n, buf } = await cleanLayer(readFileSync(`${OUT}/${f}`), bare, await labelsFor(CACHE, name, W, H), W, H, ITEMS[name.replace(/@hood$/, "")]?.slot, skin)
      if (!n) continue
      writeFileSync(`${OUT}/${f}`, buf)
      if (existsSync(`${OUT}/${name}.clip.webp`)) writeFileSync(`${OUT}/${name}.clip.webp`, await clipMask(buf, W, H))
      if (n > 500) console.log(`${b} ${name}: dropped ${n} base-model pixels`)
    }
    await handsMask(OUT, skin, W, H)
    continue
  }
  const over = async (id) => sharp(base).composite([{ input: await sharp(`${OUT}/${id}.webp`).png().toBuffer() }]).jpeg({ quality: 95 }).toBuffer()
  const ids = (only.length ? only : Object.keys(ITEMS)).filter((id) => !ITEMS[id].for || b.startsWith(`${ITEMS[id].for}-`))
    .sort((a, b) => (ITEMS[a].slot === "outer") - (ITEMS[b].slot === "outer")) // jackets last: they're drawn over the tee and hoodie layers
  for (const id of ids) {
    const it = ITEMS[id]
    try { // one bad item shouldn't stop a long batch: log it, re-run the script later to retry just the missing ones
      if (it.slot !== "outer") { await makeLayer(OUT, CACHE, W, H, id, it, base, "", skin, bare); continue }
      await makeLayer(OUT, CACHE, W, H, id, it, await over(TEE), " over the t-shirt", skin, bare)
      await makeLayer(OUT, CACHE, W, H, `${id}@hood`, it, await over(HOODIE), " over the hoodie, with the hood resting naturally outside over the collar", skin, bare)
    } catch (e) { console.log(`FAILED ${b} ${id}: ${e.message.slice(0, 200)}`) }
  }
  await handsMask(OUT, skin, W, H)
}

// what exists, for the editor: clothes layers and looks per body
const list = (dir, re) => (existsSync(dir) ? readdirSync(dir) : []).flatMap((f) => { const m = f.match(re); return m ? [m[1]] : [] }).sort()
const index = {
  v: Date.now(), // cache-buster: the editor adds ?v= to every image, so regenerated files never show stale
  layers: Object.fromEntries(BODIES.map((b) => [b, list(`public/style/layers/${b}`, /^(.+)\.webp$/).filter((f) => {
    const it = ITEMS[f.replace(/@hood$/, "")] // only items in the catalogue, and only on their gender's model
    return !f.endsWith(".clip") && it && (!it.for || b.startsWith(`${it.for}-`))
  })])),
  looks: Object.fromEntries(BODIES.map((b) => [b, list("public/style/models", new RegExp(`^${b}-(?!bare)(.+)\\.jpg$`))])),
}
writeFileSync("public/style/layers/index.json", JSON.stringify(index, null, 1))
console.log("index:", BODIES.map((b) => `${b} ${index.layers[b].length} layers / ${index.looks[b].length} looks`).join(", "))
