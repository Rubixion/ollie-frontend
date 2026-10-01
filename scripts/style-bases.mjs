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
    slim: "a slim, lean build, around US size 2-4: narrow shoulders and hips, slender arms and legs, smooth natural skin",
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
        "Keep everything else exactly as it is, pixel for pixel: hair, clothing, shoes, background. Do not zoom, crop or re-frame.", photo).catch((e) => { console.log(`  ${e.message}, retrying`); return null })
      if (!img) { if (attempt === 4) throw new Error(`no skin mask for ${photo}`); continue }
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

// Mean and spread per channel of the chest skin (skin-mask pixels a little below the neck), for the tone transfer.
function skinStats(px, mask, g, w, h) {
  const y0 = g.neck.y + Math.round(h * 0.08), y1 = g.neck.y + Math.round(h * 0.2)
  const pick = []
  for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) if (mask[y * w + x] >= 230) pick.push((y * w + x) * 3)
  const m = [0, 1, 2].map((c) => pick.reduce((a, i) => a + px[i + c], 0) / pick.length)
  const s = [0, 1, 2].map((c) => Math.sqrt(pick.reduce((a, i) => a + (px[i + c] - m[c]) ** 2, 0) / pick.length) || 1)
  return { m, s }
}

// Grow a 0/255 mask by r pixels (square), with a sliding maximum. (sharp's dilate() shrinks a white-on-black mask.)
function grow(mask, w, h, r) {
  const tmp = Buffer.alloc(w * h), out = Buffer.alloc(w * h)
  for (let y = 0; y < h; y++) for (let x = 0, last = -1e9; x < w; x++) { if (mask[y * w + x]) last = x; tmp[y * w + x] = x - last <= r ? 255 : 0 }
  for (let y = 0; y < h; y++) for (let x = w - 1, last = 1e9; x >= 0; x--) { if (mask[y * w + x]) last = x; if (last - x <= r) tmp[y * w + x] = 255 }
  for (let x = 0; x < w; x++) {
    for (let y = 0, last = -1e9; y < h; y++) { if (tmp[y * w + x]) last = y; out[y * w + x] = y - last <= r ? 255 : 0 }
    for (let y = h - 1, last = 1e9; y >= 0; y--) { if (tmp[y * w + x]) last = y; if (last - y <= r) out[y * w + x] = 255 }
  }
  return out
}

// A head mask: skin, plus anything clearly not backdrop (hair) near the face, from a little above the forehead down
// to the cut. Backdrop = close to either edge of the row. Grown by `by` px and softened by `soft`.
async function headMask(px, mask, g, w, h, cut, by, soft, strict = null) {
  const out = Buffer.alloc(w * h), skin = Buffer.alloc(w * h)
  const x0 = Math.max(0, Math.round(g.face.cx - w * 0.2)), x1 = Math.min(w, Math.round(g.face.cx + w * 0.2))
  const y0 = Math.max(0, g.top - Math.round(h * 0.07))
  for (let y = y0; y <= cut; y++) for (let x = x0; x < x1; x++) if (mask[y * w + x] > 128) skin[y * w + x] = 255
  const hairZone = grow(skin, w, h, 60) // hair sits within ~60px of the face's skin; further out it's wall texture
  for (let y = y0; y <= cut; y++) {
    const l = (y * w + 4) * 3, r = (y * w + w - 5) * 3
    for (let x = x0; x < x1; x++) {
      const p = y * w + x, i = p * 3
      const dl = Math.abs(px[i] - px[l]) + Math.abs(px[i + 1] - px[l + 1]) + Math.abs(px[i + 2] - px[l + 2])
      const dr = Math.abs(px[i] - px[r]) + Math.abs(px[i + 1] - px[r + 1]) + Math.abs(px[i + 2] - px[r + 2])
      if (skin[p] || (hairZone[p] && Math.min(dl, dr) > 50)) out[p] = 255
    }
  }
  // strict (the look's head; strict = the base's skin mask): below ear level, a row is everything between the left
  // and right edges of the look's skin OR the base's (aligned), which fills gaps in a patchy skin mask (a missed chin
  // or jaw) without taking in shadows beside the neck as "hair"
  if (strict) for (let y = Math.round(g.face.y + (g.neck.y - g.face.y) * 0.3); y <= cut; y++) {
    let l = -1, r = -1
    for (let x = x0; x < x1; x++) if (skin[y * w + x] || (y <= g.neck.y && strict[y * w + x] > 128)) { if (l < 0) l = x; r = x }
    for (let x = x0; x < x1; x++) out[y * w + x] = l >= 0 && x >= l && x <= r ? 255 : 0
  }
  const grown = by ? grow(out, w, h, by) : out
  return soft ? sharp(grown, { raw: { width: w, height: h, channels: 1 } }).blur(soft).extractChannel(0).raw().toBuffer() : grown
}

// Look photo built on the bare base, so its silhouette is the base's exactly and every clothes layer fits:
//  - the look's head (skin + hair) is moved so its neck lines up with the base's, and blended into the base's neck
//    over a soft band;
//  - first the base's own head is removed: each row of it is refilled with the base's backdrop, blended across from
//    just left and right of the head (the backdrop is a smooth gradient), so no base hair can peek out and no other
//    photo's backdrop (lighter or darker) is pasted in;
//  - then only the look's head (tight mask, soft 1-2px edge) goes on top;
//  - below the neck, the base's skin is recoloured to the look's measured skin tone (mean and spread per channel).
async function compose(bareFile, bareMask, lookImg, lookMask, w, h, name) {
  const [b, v] = await Promise.all([raw(readFileSync(bareFile), w, h), raw(lookImg, w, h)])
  const G = geometry(bareMask, w, h), L = geometry(lookMask, w, h)
  // The look images keep the base's framing and scale (asked for in the prompt; measured within ~1-4%), so only a
  // shift is needed. Horizontal: the median, over every row from the face's widest row to the neck, of the difference
  // between the two skin masks' row centres, so a patchy mask can't throw it. Vertical: the neck rows. Both capped.
  const rowCentre = (mask, y) => { let l = -1, r = -1; for (let x = 0; x < w; x++) if (mask[y * w + x] > 128) { if (l < 0) l = x; r = x } return l < 0 ? null : (l + r) / 2 }
  const diffs = []
  for (let y = G.face.y; y <= G.neck.y; y++) { const a = rowCentre(bareMask, y), c = rowCentre(lookMask, y + L.neck.y - G.neck.y); if (a !== null && c !== null) diffs.push(c - a) }
  diffs.sort((a, c) => a - c)
  const cap = (n) => Math.max(-12, Math.min(12, Math.round(n)))
  const dx = diffs.length ? cap(diffs[diffs.length >> 1]) : 0, dy = cap(L.neck.y - G.neck.y)
  // base pixel (x, y) shows the look's pixel at (lx, ly)
  const lx = (x) => x + dx, ly = (y) => y + dy
  const warped = Buffer.alloc(w * h * 3), warpedMask = Buffer.alloc(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const fx = Math.min(w - 1.001, Math.max(0, lx(x))), fy = Math.min(h - 1.001, Math.max(0, ly(y)))
    const x0 = Math.floor(fx), y0 = Math.floor(fy), ax = fx - x0, ay = fy - y0, p = y * w + x
    const k00 = y0 * w + x0, k01 = k00 + 1, k10 = k00 + w, k11 = k10 + 1
    const w00 = (1 - ax) * (1 - ay), w01 = ax * (1 - ay), w10 = (1 - ax) * ay, w11 = ax * ay
    for (let c = 0; c < 3; c++) warped[p * 3 + c] = Math.round(v[k00 * 3 + c] * w00 + v[k01 * 3 + c] * w01 + v[k10 * 3 + c] * w10 + v[k11 * 3 + c] * w11)
    warpedMask[p] = Math.round(lookMask[k00] * w00 + lookMask[k01] * w01 + lookMask[k10] * w10 + lookMask[k11] * w11)
  }
  const cut = G.neck.y + Math.round(h * 0.012), fade = 14 // join low on the neck: where the look's neck is narrower, clean backdrop shows, not the base's neck edge
  const [hb, hl] = await Promise.all([headMask(b, bareMask, G, w, h, cut + fade, 14, 0) /* generous: hair highlights can read as backdrop */, headMask(warped, warpedMask, G, w, h, cut + fade, 1, 1.2, bareMask)])
  const span = (y) => { let l = -1, r = -1; for (let x = 0; x < w; x++) if (bareMask[y * w + x] > 128) { if (l < 0) l = x; r = x } return [l, r] }
  for (let y = G.neck.y + 1; y < h; y++) {
    const [l, r] = span(y)
    const keep = Math.max(0, 1 - (y - G.neck.y) / 20) // outside the base's neck, fade (hair strands) instead of a hard cut
    for (let x = 0; x < w; x++) if (l < 0 || x < l - 6 || x > r + 6) hl[y * w + x] = warpedMask[y * w + x] > 60 ? 0 : Math.round(hl[y * w + x] * keep) // skin: off; hair: fades
  }
  const near = grow(hb, w, h, 40) // the look's head must sit near the base's: drops stray specks of "not backdrop"
  // clean plate: the base with its head painted out. The backdrop behind the head is estimated with a normalised
  // blur: blur(base outside the head) / blur(outside-the-head mask), so only clean backdrop pixels contribute and the
  // result is a smooth gradient with no streaks, whatever hair or shadow sits beside the head.
  const anySkin = Buffer.alloc(w * h); for (let p = 0; p < w * h; p++) if (bareMask[p] > 10) anySkin[p] = 255
  const nearSkin = grow(anySkin, w, h, 6) // soft skin edges are part skin: keep them out of the backdrop estimate
  const keep = Buffer.alloc(w * h), masked = Buffer.alloc(w * h * 3)
  for (let p = 0; p < w * h; p++) {
    const k = hb[p] < 128 && !nearSkin[p] && p < (cut + fade + 40) * w ? 255 : 0 // backdrop only: not head, not near skin, upper frame
    keep[p] = k
    if (k) { masked[p * 3] = b[p * 3]; masked[p * 3 + 1] = b[p * 3 + 1]; masked[p * 3 + 2] = b[p * 3 + 2] }
  }
  const [mb, kb] = await Promise.all([
    sharp(masked, { raw: { width: w, height: h, channels: 3 } }).blur(28).raw().toBuffer(),
    sharp(keep, { raw: { width: w, height: h, channels: 1 } }).blur(28).extractChannel(0).raw().toBuffer(),
  ])
  const soft = await sharp(Buffer.from(hb), { raw: { width: w, height: h, channels: 1 } }).blur(5).extractChannel(0).raw().toBuffer()
  const plate = Buffer.from(b)
  for (let p = 0; p < w * h; p++) {
    if (!soft[p] || kb[p] < 8) continue // (no backdrop nearby at all: keep the base pixel)
    const t = soft[p] / 255 // feathered edge where the cleaned backdrop meets the real one
    for (let c = 0; c < 3; c++) plate[p * 3 + c] = Math.round(t * Math.min(255, mb[p * 3 + c] * 255 / kb[p]) + (1 - t) * b[p * 3 + c])
  }
  const A = skinStats(b, bareMask, G, w, h), B = skinStats(v, lookMask, L, w, h)
  console.log(`  ${name}: shift ${dx},${dy}`)
  const out = Buffer.alloc(w * h * 3)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = y * w + x, i = p * 3, k = bareMask[p] / 255
    const band = y < cut - fade ? 1 : y > cut + fade ? 0 : (cut + fade - y) / (2 * fade) // 1 = head, 0 = body
    const look = band * (near[p] ? hl[p] / 255 : 0)
    // What sits under the look's head: in the head zone, the base's hair and its face become clean backdrop; from
    // the neck's narrowest row down, the base's own neck stays (recoloured), so the neck outline never notches.
    const keepBase = !(hb[p] >= 128) || (k >= 0.08 && y > G.neck.y) // below the neck, even a skin edge stays base
    const kk = keepBase ? Math.min(1, k * 2) : 0 // soft skin edges get the full new tone, so no light fringe
    for (let c = 0; c < 3; c++) {
      const src = keepBase ? b[i + c] : plate[i + c]
      const under = src + kk * ((b[i + c] - A.m[c]) / A.s[c] * B.s[c] + B.m[c] - src)
      out[i + c] = Math.max(0, Math.min(255, Math.round(look * warped[i + c] + (1 - look) * under)))
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
