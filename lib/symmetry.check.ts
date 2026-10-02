// Self-check for lib/symmetry.ts. Run:
//   npx esbuild lib/symmetry.check.ts --bundle --platform=node --outfile=%TEMP%/sym-check.cjs && node %TEMP%/sym-check.cjs
import assert from "node:assert/strict"
import norms from "./symmetry-norms.json"
import { align, asymmetry, beats, pose } from "./symmetry"

type P = [number, number]
const partner = norms.partner
assert.equal(partner.length, 468)
assert.ok(partner.filter((j, i) => partner[j] !== i).length < 20, "mirror pairs are (nearly all) mutual")

// A perfectly mirror-symmetric face: random left points, right points mirrored from them, midline points on x = 0
const face: P[] = Array.from({ length: 468 }, () => [0, 0])
for (let i = 0; i < 468; i++) {
  const j = partner[i]
  if (j === i) face[i] = [0, Math.sin(i)]
  else if (i < j) {
    face[i] = [-0.2 - Math.abs(Math.cos(i)), Math.sin(i * 1.7)]
    face[j] = [-face[i][0], face[i][1]]
  }
}
const rms = (d: number[]) => Math.sqrt(d.reduce((s, x) => s + x * x, 0) / d.length)
assert.ok(rms(asymmetry(face)) < 1e-9, "symmetric face scores 0")

// Moving, rotating and scaling a face doesn't change its asymmetry (after align)
const bent: P[] = face.map(([x, y], i) => [x + (x > 0 ? 0.03 * Math.sin(i) : 0), y])
const base = rms(asymmetry(align(bent).pts))
const th = 0.3
const moved: P[] = bent.map(([x, y]) => [200 + 50 * (x * Math.cos(th) - y * Math.sin(th)), 90 + 50 * (x * Math.sin(th) + y * Math.cos(th))])
const { pts, roll } = align(moved)
assert.ok(Math.abs(rms(asymmetry(pts)) - base) < 1e-9, "pose and size don't change the score")
assert.ok(base > 0, "a bent face is asymmetric")
assert.ok(Math.abs(roll) < Math.PI)

// Ranking: less asymmetry beats more faces
const q = norms.quantiles.overall
assert.equal(beats(0, q), 99)
assert.equal(beats(10, q), 1)
assert.ok(beats(q[10], q) > beats(q[40], q))
assert.ok(Math.abs(beats(q[25], q) - 50) <= 1, "the median face beats half")

// Head turn: identity matrix is straight on
const id = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
assert.deepEqual(pose(id), { yaw: 0, pitch: -0 })

console.log("symmetry checks passed")
