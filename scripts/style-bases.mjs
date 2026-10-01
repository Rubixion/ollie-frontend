// Base models for the /ai-stylist editor. A "body" is gender + build. Per gender, one anchor bare base (no top); the other
// builds are edits of it. Each look (ethnicity) is then BUILT ON the body's bare base, so its silhouette is pixel-identical
// and the body's clothes layers (scripts/style-layers.mjs) fit every look: the AI makes a look version of the photo, and
// we keep only its head (lined up at the neck) and its skin tone (applied to the base's skin via a skin mask).
// Usage (from ollie-frontend): node scripts/style-bases.mjs [male|female] [build]
// Writes public/style/models/<gender>-<build>-bare.jpg and <gender>-<build>-<look>.jpg. Delete a file to redo it.
// Then run scripts/style-layers.mjs: it rewrites public/style/layers/index.json, whose version makes browsers reload.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import sharp from "sharp"
sharp.cache(false) // libvips otherwise keeps files open, and Windows then can't replace them
import { generateImage, scriptEnv } from "../lib/image-gen.mjs"

const env = await scriptEnv()
const DIR = "public/style/models"
const LOOKS = { // keep the ids in sync with LOOKS in lib/style/model.ts
  white: "a White European",
  black: "a Black African-American",
  "east-asian": "an East Asian",
  "south-asian": "a South Asian",
  latino: "a Latino Hispanic",
  "middle-eastern": "a Middle Eastern",
}
const BUILDS = { // keep the ids in sync with BUILDS in lib/style/model.ts
  male: {
    slim: "a slim, lean build: narrow shoulders, thin arms, flat stomach, no visible muscle definition",
    average: "an average everyday build: normal shoulders, a little soft around the middle, no visible abs or muscle definition",
    athletic: "an athletic, muscular build",
    plus: "a heavier plus-size build: fuller belly, chest, arms and face, a waist around 42 inches",
  },
  female: {
    slim: "a very slim, thin build, around US size 0-2: narrow shoulders and hips, thin arms and legs, visible collarbones",
    average: "an average build",
    athletic: "an athletic, toned build: defined shoulders and arms, strong legs",
    plus: "a clearly plus-size build, around US size 20: much fuller bust, belly, hips, thighs and upper arms, a softer rounder face and jaw",
  },
}
const ANCHOR = { male: "athletic", female: "average" } // the build the original photo already has
const BARE = {
  male: "Edit this photo: remove the t-shirt so the model is bare-chested from the waist up.",
  female: "Edit this photo: replace the t-shirt with a plain fitted skin-beige sports bra top.",
}
const KEEP = "Keep exactly identical: the pose, arm and leg positions, feet position, framing, camera angle, scale, background and lighting."

const edit = async (text, file) =>
  sharp(Buffer.from((await generateImage({ text, images: [{ mime_type: "image/jpeg", data: readFileSync(file).toString("base64") }], env, timeoutMs: 600_000 })).data, "base64"))
    .jpeg({ quality: 92 }).toBuffer()

const raw = (img, w, h) => sharp(img).resize(w, h, { fit: "fill" }).removeAlpha().raw().toBuffer()

// Exact skin mask of a photo (0..255 per pixel): Gemini paints the skin magenta; cached as a PNG. The non-skin pixels
// must still match the photo, or the edit was re-framed and we ask again. Used on every bare base AND every look image,
// so both are measured the same way, whatever the skin tone.
async function skinMask(photo, cache, w, h) {
  if (!existsSync(cache)) {
    for (let attempt = 1; ; attempt++) {
      console.log(`  skin mask for ${photo.split("/").pop()} (try ${attempt})…`)
      const img = await edit("Edit this photo: paint every area of visible skin (face, ears, neck, chest, stomach, arms, hands) flat pure magenta (#FF00FF). " +
        "Keep everything else exactly as it is, pixel for pixel: hair, clothing, shoes, background. Do not zoom, crop or re-frame.", photo)
      const [m, b] = await Promise.all([raw(img, w, h), raw(readFileSync(photo), w, h)])
      const out = Buffer.alloc(w * h)
      let n = 0, diff = 0
      for (let p = 0; p < w * h; p++) {
        const i = p * 3, k = Math.min(m[i], m[i + 2]) - m[i + 1] // magenta: red and blue high, green low
        out[p] = k > 120 ? 255 : k < 60 ? 0 : Math.round(255 * (k - 60) / 60)
        if (!out[p]) { n++; diff += Math.abs(m[i] - b[i]) + Math.abs(m[i + 1] - b[i + 1]) + Math.abs(m[i + 2] - b[i + 2]) }
      }
      if (diff / n / 3 < 18) { await sharp(out, { raw: { width: w, height: h, channels: 1 } }).png().toFile(cache); break }
      console.log(`  re-framed (mean diff ${(diff / n / 3).toFixed(0)}), retrying`)
      if (attempt === 4) throw new Error(`no aligned skin mask for ${photo}`)
    }
  }
  return sharp(cache).resize(w, h, { fit: "fill" }).extractChannel(0).raw().toBuffer() // one byte per pixel
}

// Head geometry from a skin mask. Going down from the top of the head, the face widens to the cheekbones/ears, then
// narrows to the neck before the shoulders: the widest skin row within ~0.1h of the first skin row is the face, the
// narrowest row within ~0.08h below it is the neck. (Bounded searches: long hair leaves only a thin strip of skin at
// the hairline, and the shoulders widen fast below the neck.)
function geometry(mask, w, h) {
  const width = [], centre = []
  for (let y = 0; y < Math.round(h * 0.35); y++) {
    let l = -1, r = -1
    for (let x = 0; x < w; x++) if (mask[y * w + x] > 128) { if (l < 0) l = x; r = x }
    width.push(l < 0 ? 0 : r - l); centre.push((l + r) / 2)
  }
  const top = width.findIndex((v) => v > 10)
  let face = top
  for (let y = top; y < Math.min(width.length, top + Math.round(h * 0.1)); y++) if (width[y] > width[face]) face = y
  let neck = face
  for (let y = face; y < Math.min(width.length, face + Math.round(h * 0.08)); y++) if (width[y] > 0 && width[y] < width[neck]) neck = y
  return { top, face: { y: face, width: width[face], cx: centre[face] }, neck: { y: neck, width: width[neck], cx: centre[neck] } }
}

// Head-and-body silhouette for measuring: skin-mask pixels OR pixels clearly different from the backdrop (sampled at
// both edges of the row). The skin mask catches light skin that is close to the beige backdrop; the backdrop test
// catches dark skin and hair, and covers gaps when Gemini's magenta mask misses part of a face.
function silhouette(px, skin, w, h) {
  const out = Buffer.alloc(w * h)
  for (let y = 0; y < Math.round(h * 0.35); y++) {
    const l = (y * w + 4) * 3, r = (y * w + w - 5) * 3
    for (let x = 0; x < w; x++) {
      const p = y * w + x, i = p * 3
      const dl = Math.abs(px[i] - px[l]) + Math.abs(px[i + 1] - px[l + 1]) + Math.abs(px[i + 2] - px[l + 2])
      const dr = Math.abs(px[i] - px[r]) + Math.abs(px[i + 1] - px[r + 1]) + Math.abs(px[i + 2] - px[r + 2])
      out[p] = skin[p] > 128 || Math.min(dl, dr) > 40 ? 255 : 0
    }
  }
  return out
}

// Mean and spread per channel of the chest skin (skin-mask pixels a little below the neck), for the tone transfer.
function skinStats(px, mask, g, w, h) {
  const y0 = g.neck.y + Math.round(h * 0.08), y1 = g.neck.y + Math.round(h * 0.2)
  const pick = []
  for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) if (mask[y * w + x] >= 230) pick.push((y * w + x) * 3)
  const m = [0, 1, 2].map((c) => pick.reduce((a, i) => a + px[i + c], 0) / pick.length)
  const s = [0, 1, 2].map((c) => Math.sqrt(pick.reduce((a, i) => a + (px[i + c] - m[c]) ** 2, 0) / pick.length) || 1)
  return { m, s }
}

// A head mask: skin, plus anything clearly not backdrop (hair) near the face, above the cut. Grown and softened.
async function headMask(px, mask, g, w, h, cut, grow, soft) {
  const out = Buffer.alloc(w * h)
  const x0 = Math.max(0, Math.round(g.face.cx - w * 0.2)), x1 = Math.min(w, Math.round(g.face.cx + w * 0.2))
  for (let y = 0; y <= cut; y++) {
    const e = (y * w + 4) * 3 // backdrop sample at the row's left edge
    for (let x = x0; x < x1; x++) {
      const p = y * w + x, i = p * 3
      const notBackdrop = Math.abs(px[i] - px[e]) + Math.abs(px[i + 1] - px[e + 1]) + Math.abs(px[i + 2] - px[e + 2]) > 45
      if (mask[p] > 128 || notBackdrop) out[p] = 255
    }
  }
  let img = sharp(out, { raw: { width: w, height: h, channels: 1 } }).dilate(grow)
  if (soft) img = sharp(await img.extractChannel(0).raw().toBuffer(), { raw: { width: w, height: h, channels: 1 } }).blur(soft)
  return img.extractChannel(0).raw().toBuffer()
}

// Look photo built on the bare base, so its silhouette is the base's exactly and every clothes layer fits:
//  - the look's head (skin + hair) is scaled and moved so its face width and neck line match the base's, sampled
//    with bilinear filtering, and blended into the base's neck over a soft band;
//  - first the base's own head is removed: each row of it is refilled with the base's backdrop, blended across from
//    just left and right of the head (the backdrop is a smooth gradient), so no base hair can peek out and no other
//    photo's backdrop (lighter or darker) is pasted in;
//  - then only the look's head (tight mask, soft 1-2px edge) goes on top;
//  - below the neck, the base's skin is recoloured to the look's measured skin tone (mean and spread per channel).
async function compose(bareFile, bareMask, lookImg, lookMask, w, h, name) {
  const [b, v] = await Promise.all([raw(readFileSync(bareFile), w, h), raw(lookImg, w, h)])
  const G = geometry(silhouette(b, bareMask, w, h), w, h), L = geometry(silhouette(v, lookMask, w, h), w, h)
  const scale = Math.min(1.15, Math.max(0.87, G.face.width / L.face.width))
  // base pixel (x, y) shows the look's pixel at (lx, ly)
  const lx = (x) => L.face.cx + (x - G.face.cx) / scale, ly = (y) => L.neck.y + (y - G.neck.y) / scale
  const warped = Buffer.alloc(w * h * 3), warpedMask = Buffer.alloc(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const fx = Math.min(w - 1.001, Math.max(0, lx(x))), fy = Math.min(h - 1.001, Math.max(0, ly(y)))
    const x0 = Math.floor(fx), y0 = Math.floor(fy), ax = fx - x0, ay = fy - y0, p = y * w + x
    const k00 = y0 * w + x0, k01 = k00 + 1, k10 = k00 + w, k11 = k10 + 1
    const w00 = (1 - ax) * (1 - ay), w01 = ax * (1 - ay), w10 = (1 - ax) * ay, w11 = ax * ay
    for (let c = 0; c < 3; c++) warped[p * 3 + c] = Math.round(v[k00 * 3 + c] * w00 + v[k01 * 3 + c] * w01 + v[k10 * 3 + c] * w10 + v[k11 * 3 + c] * w11)
    warpedMask[p] = Math.round(lookMask[k00] * w00 + lookMask[k01] * w01 + lookMask[k10] * w10 + lookMask[k11] * w11)
  }
  const cut = G.neck.y, fade = 18
  const [hb, hl] = await Promise.all([headMask(b, bareMask, G, w, h, cut + fade, 6, 0), headMask(warped, warpedMask, G, w, h, cut + fade, 1, 1.2)])
  // clean plate: the base with its head painted out by row-wise interpolation of the backdrop either side
  const plate = Buffer.from(b)
  const avg = (y, x0, x1, c) => { let t = 0, n = 0; for (let x = Math.max(0, x0); x < Math.min(w, x1); x++) { t += b[(y * w + x) * 3 + c]; n++ } return t / n }
  for (let y = 0; y <= cut + fade; y++) {
    // one span per row, from the head's leftmost to rightmost pixel, so the samples are always clean backdrop
    let x = 0, r = w - 1
    while (x < w && hb[y * w + x] < 128) x++
    while (r > x && hb[y * w + r] < 128) r--
    if (x >= r) continue
    r++
    const left = [0, 1, 2].map((c) => avg(y, x - 10, x - 3, c)), right = [0, 1, 2].map((c) => avg(y, r + 3, r + 10, c))
    for (let xx = x; xx < r; xx++) {
      const t = (xx - x + 1) / (r - x + 1)
      for (let c = 0; c < 3; c++) plate[(y * w + xx) * 3 + c] = Math.round(left[c] * (1 - t) + right[c] * t)
    }
  }
  const A = skinStats(b, bareMask, G, w, h), B = skinStats(v, lookMask, L, w, h)
  console.log(`  ${name}: scale ${scale.toFixed(3)}, face x ${L.face.cx.toFixed(0)}->${G.face.cx.toFixed(0)}, neck y ${L.neck.y}->${G.neck.y}`)
  const out = Buffer.alloc(w * h * 3)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = y * w + x, i = p * 3, k = bareMask[p] / 255
    const band = y < cut - fade ? 1 : y > cut + fade ? 0 : (cut + fade - y) / (2 * fade) // 1 = head, 0 = body
    const look = hl[p] / 255
    for (let c = 0; c < 3; c++) {
      const body = b[i + c] + k * ((b[i + c] - A.m[c]) / A.s[c] * B.s[c] + B.m[c] - b[i + c])
      const top = look * warped[i + c] + (1 - look) * plate[i + c] // the look's head over the cleaned backdrop
      out[i + c] = Math.max(0, Math.min(255, Math.round(band * top + (1 - band) * body)))
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 3 } }).jpeg({ quality: 92 }).toBuffer()
}

const args = process.argv.slice(2)
for (const g of args[0] ? [args[0]] : ["male", "female"]) {
  const anchor = `${DIR}/${g}-${ANCHOR[g]}-bare.jpg`
  if (!existsSync(anchor)) {
    console.log(`${g}: making the bare anchor…`)
    writeFileSync(anchor, await edit(`${BARE[g]} Same person and face. ${KEEP} Keep the trousers and shoes.`, `${DIR}/${g}.jpg`))
  }
  for (const b of args[1] ? [args[1]] : Object.keys(BUILDS[g])) {
    const bare = `${DIR}/${g}-${b}-bare.jpg`
    if (!existsSync(bare)) {
      console.log(`${g}-${b}: changing the build…`)
      writeFileSync(bare, await edit(`Edit this photo: give the model ${BUILDS[g][b]}. Same person, face and hair. Their trousers and shoes are the same ` +
        `items, refitted naturally to the new body. Photorealistic, same studio quality. ${KEEP}`, anchor))
    }
    const { width: w, height: h } = await sharp(bare).metadata()
    mkdirSync(`.style-cache/${g}-${b}`, { recursive: true })
    let mask
    for (const [id, who] of Object.entries(LOOKS)) {
      const out = `${DIR}/${g}-${b}-${id}.jpg`
      if (existsSync(out)) continue
      mask ??= await skinMask(bare, `.style-cache/${g}-${b}/skin.png`, w, h)
      const src = `.style-cache/${g}-${b}/look-${id}.jpg` // the AI's look version; we keep its head and skin tone
      if (!existsSync(src)) {
        console.log(`${g}-${b}-${id}: generating…`)
        writeFileSync(src, await edit(`Edit this photo: make the model ${who} ${g === "male" ? "man, short hair" : "woman, hair tied back off the shoulders"}, ` +
          `same age, with natural facial features and skin tone across the whole body. Photorealistic, same studio quality. ${KEEP}`, bare))
      }
      const lookMask = await skinMask(src, `.style-cache/${g}-${b}/look-${id}-skin.png`, w, h)
      writeFileSync(out, await compose(bare, mask, readFileSync(src), lookMask, w, h, `${g}-${b}-${id}`))
      console.log(`${g}-${b}-${id}: saved`)
    }
  }
}
