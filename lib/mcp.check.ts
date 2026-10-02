// Run: npx tsx lib/mcp.check.ts <landmarks.json>  (a saved response from the Modal server's /landmarks)
// Checks the ChatGPT apps' face maths on a real mesh: symmetry ranks in 1-99, face shape is one of the 7.
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { analyse } from "./symmetry"
import { classify, measure } from "./style/face-shape"
import { cards } from "./style/editor"
import { toMesh } from "./mcp"

const m = toMesh(JSON.parse(readFileSync(process.argv[2], "utf8")))
assert.equal(m.lm.length, 478)
const sym = analyse(m.lm, m.w, m.h)
assert.ok(sym.beats >= 1 && sym.beats <= 99, `beats ${sym.beats}`)
const s = classify(measure(m.lm, m.w, m.h))
assert.ok(["oval", "round", "square", "oblong", "heart", "diamond", "triangle"].includes(s.shape))
assert.ok(cards("hair", { gender: "male" }, s).length >= 3)
console.log("ok", { beats: sym.beats, regions: sym.regions, shape: s.shape })
