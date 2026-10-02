// The /ai-stylist editor: which cards each tab shows (best picks first), and how a chosen look becomes the
// image-edit instruction. The server rebuilds the instruction from option ids, so no client text reaches the model.
import type { ShapeResult } from "./face-shape"
import {
  BEARD_FOR, BEARD_NOTES, BEARD_STYLES, BROW_FOR, BROWS, CUTS, GLASSES, GLASSES_FOR, ITEMS,
  type Option, type Slot, type Style, type Texture,
} from "./catalog"
import { amazon, product, rankCuts, want, weighted, type Answers, type Link } from "./recommend"

export type TabId = "hair" | "brows" | "beard" | "glasses" | Slot
export type Look = Partial<Record<TabId, string>> // tab -> chosen option id
export type Card = {
  id: string
  name: string
  sub: string
  best: boolean
  why?: string
  links: Link[]
  cut?: { ask: string; styling: string[]; weeks: number }
}

export const TABS: { id: TabId; label: string }[] = [
  { id: "hair", label: "Hair" },
  { id: "brows", label: "Brows" },
  { id: "beard", label: "Beard" },
  { id: "glasses", label: "Glasses" },
  { id: "top", label: "Tops" },
  { id: "outer", label: "Outerwear" },
  { id: "bottom", label: "Bottoms" },
  { id: "shoes", label: "Shoes" },
]

/** Tabs to show: no beard tab when the look leans feminine (the Beard tab is always opt-in anyway). */
export const tabsFor = (a: Answers) => TABS.filter((t) => t.id !== "beard" || (want(a) ?? 1) > -0.5)

const fits = (o: Option, dir?: number) => o.dir === undefined || dir === undefined || Math.abs(o.dir - dir) <= 1.1
const links = (o: Option, a: Answers) => (o.products ?? []).map((p) => product(p, a))
// put the ids in `best` first, in that order, then everything else
const bestFirst = <T extends { id: string }>(list: T[], best: string[]) =>
  [...best.map((id) => list.find((o) => o.id === id)).filter((o): o is T => !!o), ...list.filter((o) => !best.includes(o.id))]

export function cards(tab: TabId, a: Answers, s: ShapeResult, styles: Style[] = []): Card[] {
  const dir = want(a)
  const g = a.goal
  if (tab === "hair") {
    return rankCuts(a, s).map((r, i) => ({
      id: r.cut.id,
      name: r.cut.name,
      sub: r.reasons.find((x) => !x.startsWith("Suits")) ?? r.reasons[0] ?? `Trim every ${r.cut.weeks} weeks`, // the most specific reason
      best: i < 3,
      why: r.reasons.join(" · ") || undefined,
      links: r.cut.products.map((p) => product(p, a)),
      cut: { ask: r.cut.ask, styling: r.cut.styling, weeks: r.cut.weeks },
    }))
  }
  if (tab === "brows") {
    // a goal decides first; otherwise the brows that suit your face shape(s), within the look you're going for
    const shaped = weighted(BROW_FOR, s).filter((id) => fits(BROWS.find((o) => o.id === id)!, dir))
    const best = g === "younger" ? ["straight-full"] : g === "sharper" || g === "older" ? [dir !== undefined && dir < 0 ? "high-arch" : "clean-arch"]
      : g === "softer" ? ["soft-arch"] : shaped.slice(0, 2)
    const why = g ? undefined : `Suits ${/^[aeiou]/.test(s.shape) ? "an" : "a"} ${s.shape} face`
    return bestFirst(BROWS.filter((o) => fits(o, dir)), best).map((o) => ({ ...o, best: best.includes(o.id), why: best.includes(o.id) ? why : undefined, links: links(o, a) }))
  }
  if (tab === "beard") {
    const best = g === "older" ? ["full", "boxed"] : g === "younger" ? ["clean", "stubble"]
      : (a.age ?? 0) >= 35 ? weighted(BEARD_FOR, s).filter((id) => id !== "stubble").slice(0, 2) // tidier, fuller shapes read better later on
      : weighted(BEARD_FOR, s).slice(0, 2)
    return bestFirst(BEARD_STYLES, best).map((o) => ({ ...o, best: best.includes(o.id), why: best.includes(o.id) ? BEARD_NOTES[s.shape] : undefined, links: links(o, a) }))
  }
  if (tab === "glasses") {
    const best = weighted(GLASSES_FOR, s).slice(0, 2)
    return bestFirst(GLASSES.filter((o) => fits(o, dir)), ["none", ...best]).map((o) => ({
      ...o, best: best.includes(o.id), links: o.query ? [{ label: "Shop frames", href: amazon(o.query, "glasses", a.budget) }] : [],
    }))
  }
  const inSlot = ITEMS.filter((i) => i.slot === tab)
  const liked = (i: (typeof ITEMS)[number]) => i.styles.some((st) => styles.includes(st))
  return [...inSlot.filter(liked), ...inSlot.filter((i) => !liked(i))].map((i) => ({
    ...i, best: liked(i), links: [{ label: `View at ${i.brand}`, href: i.url }],
  }))
}

// ─── render instruction (server side) ────────────────────────────────────────
const find = (list: { id: string; render: string }[], id?: string) => (id ? list.find((o) => o.id === id)?.render : undefined)

/** Look -> the edit instruction for the image model, plus the product pages whose photos go along as
 *  reference images, or null if any id is unknown. */
export function instruction(look: Look, texture?: Texture): { text: string; refs: string[] } | null {
  const lines: string[] = []
  const refs: string[] = [] // product ids, for their photos
  const bad = (id: string | undefined, r: string | undefined) => id !== undefined && r === undefined
  const cut = look.hair ? CUTS.find((c) => c.id === look.hair) : undefined
  if (look.hair && !cut) return null
  if (cut) lines.push(`Hair: a ${cut.name.toLowerCase()} (${cut.ask})${texture ? `, keeping their natural ${texture} hair texture` : ""}.`)

  const brows = find(BROWS, look.brows), beard = find(BEARD_STYLES, look.beard), glasses = find(GLASSES, look.glasses)
  if (bad(look.brows, brows) || bad(look.beard, beard) || bad(look.glasses, glasses)) return null
  if (brows) lines.push(`Eyebrows: ${brows}.`)
  if (beard) lines.push(`Facial hair: ${beard}.`)
  if (glasses) lines.push(look.glasses === "none" ? "Glasses: none (remove any glasses)." : `Glasses: ${glasses}.`)

  const wear: string[] = []
  for (const slot of ["top", "outer", "bottom", "shoes"] as Slot[]) {
    const id = look[slot]
    if (!id) continue
    const it = ITEMS.find((i) => i.id === id && i.slot === slot)
    if (!it) return null
    wear.push(slot === "outer" ? `${it.render} worn over the top` : it.render)
    refs.push(it.id)
  }
  if (wear.length) lines.push(`Clothing: ${wear.join("; ")}.`)
  if (!lines.length) return null

  const text = [
    "Edit this photo of a real person. It must still clearly be the same person: keep their face shape, facial features,",
    "skin tone, age, body shape, expression, head angle, lighting and background exactly as they are. Change only the following:",
    ...lines.map((l) => `- ${l}`),
    "The result must look like an unedited photo taken at the same moment. Don't extend, re-crop or zoom the image: if a garment's",
    "area isn't visible in the photo, leave it out. No text, no watermark.",
  ].join("\n")
  return { text, refs }
}
