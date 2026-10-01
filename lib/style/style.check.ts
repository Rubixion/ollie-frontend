// Self-check for the style logic. Run:
//   npx esbuild lib/style/style.check.ts --bundle --platform=node --outfile=%TEMP%/style-check.cjs && node %TEMP%/style-check.cjs
import assert from "node:assert/strict"
import { NORMS, classify, type Ratios } from "./face-shape"
import { grooming, heightClass, rankCuts, type Answers } from "./recommend"
import { cards, instruction, tabsFor } from "./editor"

const z = (zs: number[]) => zs.map((v, i) => NORMS.mean[i] + v * NORMS.std[i]) as Ratios

assert.equal(classify(z([0.4, 0, -0.2, -0.2])).shape, "oval") // the average face is oval
assert.equal(classify(z([2, 0, 0, 0])).shape, "oblong")
assert.equal(classify(z([-0.8, 0.2, 1.2, 1.2])).shape, "square")
assert.equal(classify(z([0, 1.2, -1, -1.2])).shape, "heart")
assert.equal(classify(z([-1.5, 0, 0.5, 0.8])).shape, "round")

const base: Answers = {}
const oval = classify(z([0.4, 0, -0.2, -0.2]))
assert.ok(grooming({ ...base, age: 30 }).some((g) => g.title.includes("few nights")), "retinol step from 25")
assert.ok(!grooming({ ...base, age: 20 }).some((g) => g.title.includes("few nights")))

// editor: beard tab only when the look isn't feminine; glasses always offer "none" first
assert.ok(!tabsFor({ gender: "female" }).some((t) => t.id === "beard"))
assert.ok(tabsFor({ gender: "male" }).some((t) => t.id === "beard"))
assert.equal(cards("glasses", base, oval)[0].id, "none")
assert.ok(cards("outer", base, oval, ["old-money"])[0].best, "liked style first")

// render instruction: built only from known ids
assert.equal(instruction({ hair: "not-a-cut" }), null)
assert.equal(instruction({ top: "jcrew-ludlow" }), null, "the blazer is outerwear, not a top")
assert.equal(instruction({}), null)
const out = instruction({ hair: "textured-crop", beard: "stubble", outer: "jcrew-ludlow" }, "wavy")!
const txt = out.text
assert.ok(txt.includes("textured crop") && txt.includes("wavy") && txt.includes("stubble") && txt.includes("Ludlow"))
assert.equal(out.refs[0]?.url.startsWith("https://www.jcrew.com/"), true, "the real product page goes along as a reference")

const coily = rankCuts({ ...base, texture: "coily", direction: "masculine" }, oval)
for (const r of coily) assert.ok(r.cut.tex.includes("coily"), r.cut.id)
const bald = rankCuts({ ...base, hairline: "bald" }, oval)
for (const r of bald) assert.ok(r.cut.hairline.includes("bald"), r.cut.id)
const older = rankCuts({ ...base, goal: "older", direction: "masculine" }, oval)
assert.ok(older[0].cut.age >= 0, "look older shouldn't lead with a younger-reading cut")

// height is judged against the average for the gender given: 5'6" is short for a man, average for a woman
assert.equal(heightClass({ ...base, gender: "male", height: 168 }), "short")
assert.equal(heightClass({ ...base, gender: "female", height: 168 }), undefined)
assert.equal(heightClass({ ...base, gender: "female", height: 175 }), "tall")
assert.equal(heightClass({ ...base, gender: "male", height: 180 }), undefined)

console.log("style checks passed")
