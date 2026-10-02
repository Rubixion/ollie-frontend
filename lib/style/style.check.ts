// Self-check for the style logic. Run:
//   npx esbuild lib/style/style.check.ts --bundle --platform=node --outfile=%TEMP%/style-check.cjs && node %TEMP%/style-check.cjs
import { chooseOutfit, dressFor, layers } from "./model"
import { ITEMS, OCCASIONS } from "./catalog"
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
assert.deepEqual(out.refs, ["jcrew-ludlow"], "the real product's photo goes along as a reference")

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

// the free model: layers stack bottom-up, a jacket over a hoodie uses its hood version, tops get the jacket's clip mask
const have = ["champion-rw-hoodie", "uniqlo-u-tee", "levis-trucker", "levis-trucker@hood", "levis-501", "converse-chuck-70", "patagonia-torrentshell", "alpha-ma1"]
const stack = layers("male", "athletic", { top: "champion-rw-hoodie", outer: "levis-trucker", bottom: "levis-501", shoes: "converse-chuck-70" }, have)
assert.deepEqual(stack.map((l) => l.slot), ["shoes", "bottom", "top", "outer"])
assert.ok(stack[3].src.includes("/male-athletic/") && stack[3].src.endsWith("levis-trucker@hood.webp") && stack[2].mask?.endsWith("levis-trucker@hood.clip.webp"))
assert.ok(layers("male", "athletic", { top: "uniqlo-u-tee", outer: "levis-trucker" }, have)[1].src.endsWith("levis-trucker.webp"))
assert.equal(layers("male", "athletic", { bottom: "dickies-874" }, have).length, 0, "no layer, nothing drawn")
assert.equal(layers("male", "athletic", { top: "champion-rw-hoodie", outer: "uniqlo-uld-vest" }, [...have, "uniqlo-uld-vest", "uniqlo-uld-vest@hood"])[0].mask, undefined, "a vest never clips the sleeves of the top under it")
// choose for me: style first, plus bodies lean to longer layers, items without a layer are never picked
assert.equal(chooseOutfit("techwear", "male", have).outfit.outer, "patagonia-torrentshell")
assert.equal(chooseOutfit("minimal", "male", have).outfit.outer, undefined, "no minimal jacket has a layer here, so none")
for (const id of Object.values(chooseOutfit("workwear", "female", have, "plus").outfit)) assert.ok(have.includes(id!))
// gendered items: never chosen for the other gender, even when a layer exists
const both = [...have, "uniqlo-chesterfield", "jcrew-trench-w", "rl-oxford", "jcrew-oxford-w", "bass-weejuns", "sam-edelman-loraine", "uniqlo-smart-ankle", "uniqlo-smart-ankle-w", "jcrew-ludlow", "babaton-agency-blazer", "clarks-desert-boot"]
for (const g of ["male", "female"] as const) for (const id of Object.values(chooseOutfit("classic", g, both, "plus").outfit)) {
  const it = ITEMS.find((i) => i.id === id)!
  assert.ok(!it.for || it.for === g, `${id} offered to ${g}`)
}
assert.ok(ITEMS.find((i) => i.id === chooseOutfit("classic", "male", both, "plus").outfit.outer)?.long, "plus leans to a long coat")
// "Dress for…": the hand-picked outfit when its layers exist, Choose for me fills any gaps, all ids real
for (const [id, o] of Object.entries(OCCASIONS)) for (const g of ["male", "female"] as const) for (const it of Object.values(o[g]))
  assert.ok(ITEMS.some((i) => i.id === it && (!i.for || i.for === g)), `${id}/${g}: ${it}`)
assert.equal(dressFor("interview", "male", both).outfit.top, "rl-oxford")
assert.equal(dressFor("interview", "female", both).outfit.outer, "babaton-agency-blazer")
assert.ok(dressFor("older", "male", have).outfit.bottom, "missing layers are filled in, not left empty")
assert.ok(new Set(ITEMS.map((i) => i.id)).size === ITEMS.length, "item ids are unique")

console.log("style checks passed")
