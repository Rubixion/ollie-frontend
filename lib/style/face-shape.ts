// Face shape from MediaPipe Face Landmarker points (478-point mesh, normalised 0..1 x/y).
// Four width/length ratios along the face outline, turned into z-scores against real faces
// (NORMS, measured on the celebrity index), then matched to the nearest shape prototype.

export type Shape = "oval" | "round" | "square" | "oblong" | "heart" | "diamond" | "triangle"
export type Ratios = [length: number, forehead: number, jaw: number, chin: number]
type Pt = { x: number; y: number }

// Mesh outline indices: top of forehead 10, chin 152, temples 21/251, cheekbones 234/454,
// lower jaw 58/288, chin sides 150/379.
const dist = (a: Pt, b: Pt, w: number, h: number) => Math.hypot((a.x - b.x) * w, (a.y - b.y) * h)

/** One frame's ratios, all relative to cheekbone width. w/h = video size, so x and y share a scale. */
export function measure(lm: Pt[], w: number, h: number): Ratios {
  const cheek = dist(lm[234], lm[454], w, h)
  return [
    dist(lm[10], lm[152], w, h) / cheek,
    dist(lm[21], lm[251], w, h) / cheek,
    dist(lm[58], lm[288], w, h) / cheek,
    dist(lm[150], lm[379], w, h) / cheek,
  ]
}

// Mean and spread of each ratio over 9,195 frontal photos of 4,824 people in the celebrity index
// (celeb_v2/face_norms.py, 2026-09-28).
export const NORMS = { mean: [1.184, 0.933, 0.903, 0.578], std: [0.058, 0.021, 0.02, 0.027] }

// In z-score units: [length, forehead, jaw, chin]. The average face is oval, as stylists use the word.
// ponytail: hand-set prototypes; fit them to labelled faces if users report wrong shapes.
const PROTOTYPES: Record<Shape, Ratios> = {
  oval: [0.4, 0, -0.2, -0.2],
  round: [-1.2, 0, 0.4, 0.6],
  square: [-0.6, 0.2, 1, 1],
  oblong: [1.4, 0, 0.2, 0],
  heart: [0, 1, -0.8, -1],
  diamond: [0.2, -1, -0.6, -0.6],
  triangle: [-0.2, -1, 1, 0.6],
}

// probs: how likely each shape is. Face shape from one scan is only moderately repeatable (on the celebrity
// photos, a person's ratios vary ~0.65x as much photo-to-photo as between people), so the recommender
// scores cuts against all of probs rather than trusting the top shape alone.
export type ShapeResult = { shape: Shape; second: Shape; confidence: number; probs: Record<Shape, number>; z: Ratios }

export function classify(r: Ratios): ShapeResult {
  const z = r.map((v, i) => (v - NORMS.mean[i]) / NORMS.std[i]) as Ratios
  const scored = (Object.entries(PROTOTYPES) as [Shape, Ratios][])
    .map(([shape, p]) => ({ shape, w: Math.exp(-p.reduce((s, pv, i) => s + (z[i] - pv) ** 2, 0) / 2) }))
    .sort((a, b) => b.w - a.w)
  const total = scored.reduce((s, x) => s + x.w, 0) || 1
  const probs = Object.fromEntries(scored.map((x) => [x.shape, x.w / total])) as Record<Shape, number>
  return { shape: scored[0].shape, second: scored[1].shape, confidence: probs[scored[0].shape], probs, z }
}

/** Average of many frames' ratios (the scan keeps only straight-on frames). */
export const average = (rs: Ratios[]) => [0, 1, 2, 3].map((i) => rs.reduce((s, r) => s + r[i], 0) / rs.length) as Ratios

export const SHAPE_INFO: Record<Shape, string> = {
  oval: "Balanced proportions, a little longer than wide, with a jaw slightly narrower than your cheekbones. Most cuts work.",
  round: "Width and length are close, with soft, full cheeks and a rounded jaw. Height on top and tight sides lengthen it.",
  square: "A strong, wide jaw about as wide as your forehead. Texture and some softness on top balance the angles.",
  oblong: "Noticeably longer than wide. Avoid extra height; fuller sides and a fringe shorten it.",
  heart: "A wider forehead that narrows to a slimmer chin. Weight around the lower half and a fringe balance it.",
  diamond: "Cheekbones are the widest point, with a narrower forehead and chin. Fringes and fullness at the temples help.",
  triangle: "A jaw wider than your forehead. Volume on top and at the temples balances the lower face.",
}
