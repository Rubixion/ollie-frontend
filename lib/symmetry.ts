// Face symmetry from MediaPipe Face Landmarker points, for the hidden /face-symmetry-test tool.
// Same maths as neural network learning/celeb_v2/symmetry_norms.py, which made symmetry-norms.json from 3,000+
// straight-on celebrity photos: each mesh point's mirror partner, and quantiles to rank a face against real ones.
import norms from "./symmetry-norms.json"

export type Region = "eyes" | "brows" | "nose" | "mouth" | "jaw"
export const REGIONS: Region[] = ["eyes", "brows", "nose", "mouth", "jaw"]
export const NORMS_N = norms.n
export const MAX_YAW = norms.maxYaw
export const MAX_PITCH = norms.maxPitch

type P = [number, number]
const N = 468
const EYES: [number[], number[]] = [[33, 133], [362, 263]]
const mean = (ps: P[]): P => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length]

/** Pixel points -> eye centres at (+-0.5, 0): removes position, roll and size. Also returns the roll in radians. */
export function align(px: P[]): { pts: P[]; roll: number } {
  const l = mean(EYES[0].map((i) => px[i])), r = mean(EYES[1].map((i) => px[i]))
  const vx = r[0] - l[0], vy = r[1] - l[1]
  const s = Math.hypot(vx, vy), c = vx / s, si = vy / s
  const mx = (l[0] + r[0]) / 2, my = (l[1] + r[1]) / 2
  const pts = px.slice(0, N).map(([x, y]): P => {
    const dx = x - mx, dy = y - my
    return [(dx * c + dy * si) / s, (-dx * si + dy * c) / s]
  })
  return { pts, roll: Math.atan2(vy, vx) }
}

/** Per-point leftover after mirroring the face and fitting it back onto itself (best rotation + shift), in eye-distance units. */
export function asymmetry(p: P[], partner: number[] = norms.partner): number[] {
  const q = partner.map((j): P => [-p[j][0], p[j][1]])
  const pm = mean(p), qm = mean(q)
  let a = 0, b = 0
  for (let i = 0; i < p.length; i++) {
    const px = p[i][0] - pm[0], py = p[i][1] - pm[1], qx = q[i][0] - qm[0], qy = q[i][1] - qm[1]
    a += qx * px + qy * py
    b += qx * py - qy * px
  }
  const t = Math.atan2(b, a), c = Math.cos(t), s = Math.sin(t)
  return p.map((pp, i) => {
    const qx = q[i][0] - qm[0], qy = q[i][1] - qm[1]
    return Math.hypot(qx * c - qy * s - (pp[0] - pm[0]), qx * s + qy * c - (pp[1] - pm[1])) / 2
  })
}

const rms = (d: number[], idx?: number[]) => {
  const v = idx ? idx.map((i) => d[i]) : d
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0) / v.length)
}

/** % of the reference faces that are LESS symmetric than this value (higher = more symmetric). */
export function beats(value: number, q: number[], pct: number[] = norms.quantiles.pct): number {
  if (value <= q[0]) return 99
  if (value >= q[q.length - 1]) return 1
  let i = 1
  while (q[i] < value) i++
  const at = pct[i - 1] + ((value - q[i - 1]) / (q[i] - q[i - 1])) * (pct[i] - pct[i - 1])
  return Math.max(1, Math.min(99, Math.round(100 - at)))
}

export type SymmetryResult = { overall: number; beats: number; regions: Record<Region, number>; roll: number }

/** Landmarks normalised 0..1 (MediaPipe) + image size -> how symmetric, ranked against real faces. */
export function analyse(lm: { x: number; y: number }[], w: number, h: number): SymmetryResult {
  const { pts, roll } = align(lm.map((p): P => [p.x * w, p.y * h]))
  const d = asymmetry(pts)
  const overall = rms(d)
  const regions = Object.fromEntries(
    REGIONS.map((r) => [r, beats(rms(d, norms.regions[r]), norms.quantiles[r])]),
  ) as Record<Region, number>
  return { overall, beats: beats(overall, norms.quantiles.overall), regions, roll }
}

/** Head turn from MediaPipe's 4x4 face transform (column-major array), in degrees. Same formula as the style scan. */
export function pose(m: number[]): { yaw: number; pitch: number } {
  // row-major m[r][c] = data[c * 4 + r]
  const at = (r: number, c: number) => m[c * 4 + r]
  return {
    yaw: (Math.atan2(at(0, 2), at(2, 2)) * 180) / Math.PI,
    pitch: (Math.atan2(-at(1, 2), Math.hypot(at(0, 2), at(2, 2))) * 180) / Math.PI,
  }
}

export const REGION_LABEL: Record<Region, string> = { eyes: "Eyes", brows: "Eyebrows", nose: "Nose", mouth: "Mouth", jaw: "Jaw and face outline" }
