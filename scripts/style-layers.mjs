// Clothes layers for the /ai-stylist model: each catalogue item is rendered ONCE per gender on the bare base model and cut
// out as a see-through layer, so any outfit is just stacked layers in the browser (no image cost per outfit).
// A "body" is gender + build (male-athletic, female-plus, ...), see scripts/style-bases.mjs.
// Usage (from ollie-frontend): npx tsx scripts/style-layers.mjs [body|gender ...] [itemId ...]
// Writes public/style/layers/<body>/<id>.webp (+ <id>@hood.webp and <id>.clip.webp for jackets) and
// public/style/layers/index.json. Work files are cached in .style-cache/<body>/ so re-runs don't pay twice.
// Each item = 2 image calls: (1) put the item on the base model, (2) paint everything except the item pure green.
// Jackets get one more pair, drawn over the hoodie, so a hood sits naturally over the collar.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs"
import sharp from "sharp"
sharp.cache(false) // libvips otherwise keeps files open, and Windows then can't replace them
import { generateImage, scriptEnv } from "../lib/image-gen.mjs"
import { ITEMS as CATALOG } from "../lib/style/catalog.ts"

const env = await scriptEnv()
const NOUN = { top: "top", outer: "outer layer (jacket, coat or vest)", bottom: "trousers", shoes: "pair of shoes" }
const ITEMS = Object.fromEntries(CATALOG.map((i) => [i.id, {
  slot: i.slot, noun: NOUN[i.slot], hood: /hoodie/i.test(i.name),
  what: i.slot === "outer" ? `${i.render}, worn open` : i.render,
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

async function makeLayer(OUT, CACHE, W, H, name, it, start, under = "", skin = null) {
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
  writeFileSync(`${OUT}/${name}.webp`, layer)
  if (it.slot === "outer") writeFileSync(`${OUT}/${name}.clip.webp`, await clipMask(layer, W, H))
  console.log(`${OUT.split("/").pop()} ${name}: layer saved`)
}

const BODIES = ["male", "female"].flatMap((g) => ["slim", "average", "athletic", "plus"].map((b) => `${g}-${b}`))
const args = process.argv.slice(2)
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
  const over = async (id) => sharp(base).composite([{ input: await sharp(`${OUT}/${id}.webp`).png().toBuffer() }]).jpeg({ quality: 95 }).toBuffer()
  const ids = (only.length ? only : Object.keys(ITEMS))
    .sort((a, b) => (ITEMS[a].slot === "outer") - (ITEMS[b].slot === "outer")) // jackets last: they're drawn over the tee and hoodie layers
  for (const id of ids) {
    const it = ITEMS[id]
    if (it.slot !== "outer") { await makeLayer(OUT, CACHE, W, H, id, it, base, "", skin); continue }
    await makeLayer(OUT, CACHE, W, H, id, it, await over(TEE), " over the t-shirt", skin)
    await makeLayer(OUT, CACHE, W, H, `${id}@hood`, it, await over(HOODIE), " over the hoodie, with the hood resting naturally outside over the collar", skin)
  }
}

// what exists, for the editor: clothes layers and looks per body
const list = (dir, re) => (existsSync(dir) ? readdirSync(dir) : []).flatMap((f) => { const m = f.match(re); return m ? [m[1]] : [] }).sort()
const index = {
  v: Date.now(), // cache-buster: the editor adds ?v= to every image, so regenerated files never show stale
  layers: Object.fromEntries(BODIES.map((b) => [b, list(`public/style/layers/${b}`, /^(.+)\.webp$/).filter((f) => !f.endsWith(".clip"))])),
  looks: Object.fromEntries(BODIES.map((b) => [b, list("public/style/models", new RegExp(`^${b}-(?!bare)(.+)\\.jpg$`))])),
}
writeFileSync("public/style/layers/index.json", JSON.stringify(index, null, 1))
console.log("index:", BODIES.map((b) => `${b} ${index.layers[b].length} layers / ${index.looks[b].length} looks`).join(", "))
