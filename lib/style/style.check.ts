// Self-check for the style logic. Run:
//   npx esbuild lib/style/style.check.ts --bundle --platform=node --outfile=%TEMP%/style-check.cjs && node %TEMP%/style-check.cjs
import { chooseOutfit, dressFor, layers } from "./model"
import { BROW_FOR, FRINGE, GLASSES_FOR, ITEMS, OCCASIONS, OFF_FOREHEAD } from "./catalog"
import CELEBS from "./celeb-shapes.json"
import assert from "node:assert/strict"
import { NORMS, classify, type Ratios, type ShapeResult } from "./face-shape"
import { grooming, heightClass, rankCuts, shapeLabel, weighted, type Answers } from "./recommend"
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
const both = [...have, "uniqlo-chesterfield", "jcrew-trench-w", "rl-oxford", "jcrew-oxford-w", "bass-weejuns", "sam-edelman-loraine", "uniqlo-smart-ankle", "uniqlo-smart-ankle-w", "jcrew-ludlow", "babaton-agency-blazer", "clarks-desert-boot", "uniqlo-dress-shirt", "ae-park-avenue", "tnf-nuptse", "levis-trucker"]
for (const g of ["male", "female"] as const) for (const id of Object.values(chooseOutfit("classic", g, both, "plus").outfit)) {
  const it = ITEMS.find((i) => i.id === id)!
  assert.ok(!it.for || it.for === g, `${id} offered to ${g}`)
}
assert.ok(ITEMS.find((i) => i.id === chooseOutfit("classic", "male", both, "plus").outfit.outer)?.long, "plus leans to a long coat")
// "Dress for…": the hand-picked outfit when its layers exist, Choose for me fills any gaps, all ids real
for (const [id, o] of Object.entries(OCCASIONS)) for (const g of ["male", "female"] as const)
  for (const it of [...Object.values(o[g]), ...Object.values(o.builds ?? {}).flatMap((b) => Object.values(b[g] ?? {}))]) assert.ok(ITEMS.some((i) => i.id === it && (!i.for || i.for === g)), `${id}/${g}: ${it}`)
assert.equal(dressFor("interview", "male", both).outfit.top, "uniqlo-dress-shirt")
assert.equal(dressFor("younger", "male", both, "plus").outfit.outer, "levis-trucker", "body-type swap applies")
assert.equal(dressFor("younger", "male", both, "slim").outfit.outer, "tnf-nuptse")
assert.equal(dressFor("interview", "female", both).outfit.outer, "babaton-agency-blazer")
assert.ok(dressFor("older", "male", have).outfit.bottom, "missing layers are filled in, not left empty")
assert.ok(new Set(ITEMS.map((i) => i.id)).size === ITEMS.length, "item ids are unique")

// ─── recommendations beyond face shape ───
// between shapes: a face the scan can't call between oval and oblong gets picks that suit both, and says so
const between: ShapeResult = { shape: "oval", second: "oblong", confidence: 0.45, z: [0, 0, 0, 0],
  probs: { oval: 0.45, oblong: 0.4, round: 0.05, square: 0.04, heart: 0.03, diamond: 0.02, triangle: 0.01 } }
assert.equal(shapeLabel(between), "oval, close to oblong")
assert.equal(shapeLabel(oval).includes("close to"), oval.probs[oval.second] >= oval.probs.oval - 0.15)
assert.ok(weighted(GLASSES_FOR, between).slice(0, 2).some((id) => GLASSES_FOR.oblong.includes(id)), "oblong half still counts")
// hairline: a receding or high hairline never leads with a cut that shows the forehead; a fringe comes first
for (const hairline of ["receding", "high", "slight"] as const) {
  const top = rankCuts({ ...base, gender: "male", hairline }, between)[0].cut.id
  assert.ok(!OFF_FOREHEAD.has(top), `${hairline}: ${top}`)
  assert.ok(FRINGE.has(top) || top === "buzz" || top === "shaved", `${hairline}: ${top} should be a fringe or a clean buzz`)
}
assert.ok(rankCuts({ ...base, hairline: "high" }, between).some((r) => r.cut.hairline.includes("full") && !r.cut.hairline.includes("slight")),
  "a high hairline is still a full one: full-only cuts aren't filtered out")
// age: 35+ doesn't lead with a Gen-Z-only cut; brows follow the face shape when there's no goal
assert.ok(rankCuts({ ...base, gender: "male", age: 42 }, between).slice(0, 3).every((r) => !(r.cut.tracks.length === 1 && r.cut.tracks[0] === "genz")))
assert.ok(BROW_FOR.oval.includes(cards("brows", { gender: "male" }, between).find((c) => c.best)!.id) ||
  BROW_FOR.oblong.includes(cards("brows", { gender: "male" }, between).find((c) => c.best)!.id))
// hair type unknown: the top pick works for most hair (no waves or twists until they say their hair is coily)
for (const g of ["male", "female"] as const) assert.ok(rankCuts({ ...base, gender: g }, between)[0].cut.tex.length >= 3, g)
// celebrities: every shape has people (oval included), each with a photo credit, and no politics, royalty or religion
for (const [shape, people] of Object.entries(CELEBS)) {
  assert.ok(people.length >= 4, `${shape} has a list`)
  for (const c of people) {
    assert.ok(c.credit?.page && c.credit.license, `${c.name} has a credit`)
    assert.ok(!/politic|president|minister|prince|princess|king of|queen of|pope|senator|activist/i.test(c.knownFor), `${c.name}: ${c.knownFor}`)
  }
}

console.log("style checks passed")

// ─── budgets ───
{
  const { BUDGETS, ITEMS: ALL } = await import("./catalog")
  const { chooseOutfit: pick, dressFor: dress, outfitTotal } = await import("./model")
  const every = ALL.map((i) => i.id)
  const cheap = pick("classic", "male", every, "average", 1).outfit
  for (const id of Object.values(cheap)) { const it = ALL.find((i) => i.id === id)!; assert.ok(it.usd <= BUDGETS[1].cap![it.slot], `${id} over budget`) }
  assert.ok(outfitTotal(cheap) < outfitTotal(pick("classic", "male", every, "average", 3).outfit), "premium costs more than budget")
  assert.notEqual(dress("interview", "male", every, "average", 1).outfit.shoes, "ae-park-avenue", "a $395 shoe gives way on a budget")
  assert.equal(dress("interview", "male", every, "average").outfit.shoes, "ae-park-avenue")
}
