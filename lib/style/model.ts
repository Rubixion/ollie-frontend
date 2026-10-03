// The free model in the /ai-stylist editor: who the model looks like, body type, and "choose my clothes for me".
// A "body" is gender + build. Photos: public/style/models/<body>-<look>.jpg (scripts/style-bases.mjs). All looks of
// one body share its exact shape and pose, so that body's clothes layers (public/style/layers/<body>/,
// scripts/style-layers.mjs) fit every look. public/style/layers/index.json lists what exists.
import { BUDGETS, ITEMS, OCCASIONS, STYLES, type Budget, type Gender, type OccasionId, type Slot, type Style } from "./catalog"

export type { Gender }
export const LOOKS = [ // keep the ids in sync with LOOKS in scripts/style-bases.mjs
  { id: "white", label: "White" },
  { id: "black", label: "Black" },
  { id: "east-asian", label: "East Asian" },
  { id: "south-asian", label: "South Asian" },
  { id: "latino", label: "Latino" },
  { id: "middle-eastern", label: "Middle Eastern" },
] as const
export type LookId = (typeof LOOKS)[number]["id"]
export const BUILDS = [ // keep in sync with BUILDS in scripts/style-bases.mjs
  { id: "slim", label: "Slim" },
  { id: "average", label: "Average" },
  { id: "athletic", label: "Athletic" },
  { id: "plus", label: "Plus" },
] as const
export type Build = (typeof BUILDS)[number]["id"]
export const body = (g: Gender, b: Build) => `${g}-${b}`
export const modelPhoto = (g: Gender, b: Build, look: LookId) => `/style/models/${body(g, b)}-${look}.jpg`
/** What's been generated: clothes layers and looks per body. */
export type Assets = { v?: number; layers: Record<string, string[]>; looks: Record<string, string[]> }

// ─── layers ──────────────────────────────────────────────────────────────────
export const LAYER_ORDER: Slot[] = ["shoes", "bottom", "top", "outer"] // bottom of the stack first
const HOODED = new Set(ITEMS.filter((i) => /hoodie/i.test(i.name)).map((i) => i.id))
// a vest has no sleeves, so the top's sleeves must show in full: no clip mask
const VESTS = new Set(ITEMS.filter((i) => / vest/i.test(i.name)).map((i) => i.id))
export type Outfit = Partial<Record<Slot, string>>
/** The layer images for an outfit, bottom first. A jacket over a hoodie uses its "@hood" version; the top under a
 *  jacket gets the jacket's clip mask so its sleeves never poke out at the sides. */
export function layers(g: Gender, b: Build, outfit: Outfit, have: string[]) {
  const dir = `/style/layers/${body(g, b)}`
  const outer = outfit.outer && (outfit.top && HOODED.has(outfit.top) && have.includes(`${outfit.outer}@hood`) ? `${outfit.outer}@hood` : outfit.outer)
  return LAYER_ORDER.flatMap((slot) => {
    const id = slot === "outer" ? outer : outfit[slot]
    if (!id || !have.includes(id)) return []
    return [{ slot, src: `${dir}/${id}.webp`, mask: slot === "top" && outer && !VESTS.has(outfit.outer!) ? `${dir}/${outer}.clip.webp` : undefined }]
  })
}

// ─── choose my clothes for me ────────────────────────────────────────────────
/** Within budget: at or under the slot's cap (Premium has none). */
const fits = (i: (typeof ITEMS)[number], budget?: Budget) => !budget || !BUDGETS[budget].cap || i.usd <= BUDGETS[budget].cap![i.slot]

/** Best item per slot for a look, body type and budget, using only items that have a layer for this model. */
export function chooseOutfit(style: Style, g: Gender, have: string[], b?: Build, budget?: Budget): { outfit: Outfit; notes: string[] } {
  const outfit: Outfit = {}
  for (const slot of LAYER_ORDER) {
    const all = ITEMS.filter((i) => i.slot === slot && have.includes(i.id) && (!i.for || i.for === g))
    // nothing in budget for this slot: fall back to the cheapest piece rather than leave it empty
    const pool = all.some((i) => fits(i, budget)) ? all.filter((i) => fits(i, budget)) : [...all].sort((x, y) => x.usd - y.usd).slice(0, 1)
    const rank = (i: (typeof pool)[number]) =>
      (i.styles.includes(style) ? 10 : 0) +
      (i.styles[0] === style ? 1 : 0) + // the style it's most typical of
      (slot === "outer" && b === "plus" && i.long ? 2 : 0) + // plus: longer layers over cropped
      (budget === 3 ? Math.min(2, i.usd / 200) : 0) // premium: lean to the better-made, dearer piece
    const best = [...pool].sort((a, b) => rank(b) - rank(a))[0]
    // jackets are optional: only add one that fits the look
    if (best && (slot !== "outer" || best.styles.includes(style))) outfit[slot] = best.id
  }
  const notes = [`${STYLES[style].label}: ${STYLES[style].blurb}`]
  if (b === "slim") notes.push("Structured jackets and heavier fabrics add presence.")
  if (b === "athletic") notes.push("Straight or tapered trousers balance broader shoulders.")
  if (b === "plus") notes.push("Darker, structured pieces that skim rather than cling.")
  return { outfit, notes }
}

/** A hand-picked "Dress for…" outfit. Pieces without a layer for this model are filled in by chooseOutfit. */
export function dressFor(id: OccasionId, g: Gender, have: string[], b?: Build, budget?: Budget): { outfit: Outfit; notes: string[] } {
  const o = OCCASIONS[id]
  const fill = chooseOutfit(o.style, g, have, b, budget)
  const outfit: Outfit = { ...fill.outfit }
  const picks = { ...o[g], ...(b && o.builds?.[b]?.[g]) }
  // a hand-picked piece over budget gives way to Choose for me's in-budget pick for that slot
  for (const [slot, item] of Object.entries(picks) as [Slot, string][])
    if (have.includes(item) && fits(ITEMS.find((i) => i.id === item)!, budget)) outfit[slot] = item
  return { outfit, notes: [...o.notes, ...fill.notes.slice(1)] }
}

/** Rough cost of an outfit in USD (brand prices where known, typical list prices otherwise). */
export const outfitTotal = (o: Outfit) => Object.values(o).reduce((t, id) => t + (ITEMS.find((i) => i.id === id)?.usd ?? 0), 0)
