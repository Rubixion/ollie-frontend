// Scan + quiz answers -> ranked haircuts, grooming and fit notes. Pure rules: same answers, same advice.
import type { Shape, ShapeResult } from "./face-shape"
import {
  CUTS, FRINGE, OFF_FOREHEAD, PRICE_TIERS, PRODUCTS,
  type Cut, type Hairline, type Kind, type ProductId, type Style, type Texture,
} from "./catalog"

export type Goal = "older" | "younger" | "sharper" | "softer" | "low-effort" | "stand-out" | "keep"
export type Answers = {
  age?: number
  gender?: "male" | "female" | "other"
  direction?: "masculine" | "feminine" | "neutral"
  height?: number // cm
  build?: "slim" | "average" | "athletic" | "broad" | "bigger"
  texture?: Texture
  hairline?: Hairline
  beard?: "yes" | "maybe" | "no"
  glasses?: "yes" | "open" | "no"
  goal?: Goal
  life?: "office" | "creative" | "trades" | "student" | "mix"
  styles?: Style[]
  budget?: 1 | 2 | 3
  maintenance?: "often" | "monthly" | "rarely"
}

export type Link = { label: string; href: string }
export type RankedCut = { cut: Cut; score: number; reasons: string[] }

// ─── affiliate links ─────────────────────────────────────────────────────────
const TAG = process.env.NEXT_PUBLIC_AMAZON_TAG
const DOMAIN = process.env.NEXT_PUBLIC_AMAZON_DOMAIN ?? "amazon.com"

export function amazon(query: string, kind: Kind, budget?: 1 | 2 | 3) {
  const u = new URL(`https://www.${DOMAIN}/s`)
  u.searchParams.set("k", query)
  if (budget) {
    const [lo, hi] = PRICE_TIERS[kind][budget - 1]
    u.searchParams.set("rh", `p_36:${lo * 100}-${hi * 100}`) // Amazon's price filter, in cents
  }
  if (TAG) u.searchParams.set("tag", TAG)
  return u.toString()
}

export const want = (a: Answers) =>
  a.direction === "masculine" ? 1 : a.direction === "feminine" ? -1 : a.direction === "neutral" ? 0
  : a.gender === "male" ? 1 : a.gender === "female" ? -1 : undefined

// men's / women's in clothing searches, when we know which way they want to go
export const who = (a: Answers) => ({ 1: "men's ", [-1]: "women's " } as Record<number, string>)[want(a) ?? 0] ?? ""

export function product(id: ProductId, a: Answers): Link {
  const p = PRODUCTS[id]
  return { label: p.label, href: amazon(p.query, p.kind, a.budget) }
}

// Short / tall relative to the average for their gender (roughly the bottom and top ~15%).
// ponytail: fixed cut-offs, US/UK adult averages; make them per-country if the audience skews elsewhere.
const HEIGHT_CUTOFFS = { male: [170, 185], female: [157, 172], other: [163, 180] }
export function heightClass(a: Answers): "short" | "tall" | undefined {
  if (!a.height) return undefined
  const [short, tall] = HEIGHT_CUTOFFS[a.gender ?? "other"]
  return a.height < short ? "short" : a.height >= tall ? "tall" : undefined
}

// ─── haircuts ────────────────────────────────────────────────────────────────
/** Ids from a per-shape "best first" table, ranked over every shape the scan thinks you might be: a face that's
 *  45% oval and 40% oblong gets picks that suit both, not just oval's. */
export function weighted(table: Record<Shape, string[]>, s: ShapeResult): string[] {
  const score = new Map<string, number>()
  for (const [shape, p] of Object.entries(s.probs) as [Shape, number][])
    table[shape].forEach((id, i) => score.set(id, (score.get(id) ?? 0) + p * (i === 0 ? 1 : 0.6)))
  return [...score.entries()].sort((x, y) => y[1] - x[1]).map(([id]) => id)
}

/** "oval" or "oval, close to oblong" when the second shape is nearly as likely. */
export const shapeLabel = (s: ShapeResult) => s.probs[s.second] >= s.probs[s.shape] - 0.15 ? `${s.shape}, close to ${s.second}` : s.shape

export type AgeBand = "18-24" | "25-34" | "35-49" | "50+"
export const AGE_BANDS: Record<AgeBand, number> = { "18-24": 21, "25-34": 30, "35-49": 42, "50+": 55 } // stored as a.age

function score(cut: Cut, a: Answers, s: ShapeResult): { score: number; reasons: string[] } | null {
  const dir = want(a)
  if (a.texture && !cut.tex.includes(a.texture)) return null
  const hl = a.hairline === "high" ? "full" : a.hairline // a high hairline is still a full one
  if (hl && !cut.hairline.includes(hl)) return null
  if (dir !== undefined && Math.abs(cut.dir - dir) > 1.1) return null

  let score = 0
  const reasons: string[] = []
  // expected fit over every shape the scan thinks you might be, not just the top one
  for (const [shape, p] of Object.entries(s.probs) as [Shape, number][]) {
    score += 4 * p * (cut.good.includes(shape) ? 1 : cut.avoid.includes(shape) ? -1 : 0)
  }
  if (cut.good.includes(s.shape)) reasons.push(`Suits ${/^[aeiou]/.test(s.shape) ? "an" : "a"} ${s.shape} face`)
  if (dir !== undefined) score -= 0.5 * Math.abs(cut.dir - dir)

  const g = a.goal
  if (g === "older" || g === "younger") {
    const fit = (g === "older" ? 1 : -1) * cut.age
    score += 1.5 * fit
    if (fit > 0) reasons.push(g === "older" ? "Reads more mature" : "Reads younger")
  }
  if (g === "sharper") { score += cut.dir * (dir ?? 1) > 0 ? 1 : 0; if (cut.weeks <= 3) { score += 0.5; reasons.push("Sharp, defined lines") } }
  if (g === "softer" && cut.weeks >= 6) { score += 1; reasons.push("Softer, more relaxed shape") }
  if (g === "low-effort" || a.maintenance === "rarely") {
    score += cut.weeks >= 6 ? 1.5 : -1
    if (cut.weeks >= 6) reasons.push("Grows out well, low upkeep")
  }
  if (a.maintenance === "monthly") score += cut.weeks >= 4 ? 0.5 : -0.5
  if (g === "stand-out" && cut.tracks.includes("genz")) score += 1

  const hc = heightClass(a)
  if (hc === "short" && cut.height) { score += 1; reasons.push("Height on top adds to your height") }
  if (hc === "tall" && cut.height) score -= 1
  if ((a.build === "bigger" || a.build === "broad") && cut.height) { score += 0.5; reasons.push("Lengthens the face and frame") }

  if ((a.life === "office" || a.life === "trades") && cut.tracks.includes("working")) score += 0.5
  if ((a.life === "student" || a.life === "creative") && cut.tracks.includes("genz")) score += 0.5
  // hair type not given yet: cuts that need one particular texture (waves, twists, sleek) shouldn't lead
  if (!a.texture && cut.tex.length <= 2) score -= 1

  // hairline: a fringe hides a high or receding one; pulling hair up and back shows it
  if (a.hairline === "high" || a.hairline === "slight" || a.hairline === "receding") {
    if (FRINGE.has(cut.id)) { score += 1; reasons.push(a.hairline === "high" ? "The fringe balances a taller forehead" : "The fringe softens a receding hairline") }
    if (OFF_FOREHEAD.has(cut.id)) score -= 1
  }
  if (a.hairline === "thinning") {
    if (cut.weeks <= 3) { score += 1; reasons.push("Short and textured, so thinning shows less") }
    if (cut.weeks >= 8) score -= 1
  }
  if ((a.hairline === "receding" || a.hairline === "bald") && (cut.id === "buzz" || cut.id === "shaved")) { score += 0.5; reasons.push("Owns the hairline instead of hiding it") }

  // age band: trends for the young, polish later on
  const age = a.age
  if (age !== undefined) {
    if (age < 25 && cut.tracks.includes("genz")) score += 0.5
    if (age >= 25 && age < 35 && cut.tracks.includes("working")) score += 0.5
    if (age >= 35 && (cut.tracks.includes("classic") || cut.tracks.includes("working"))) score += 0.5
    if (age >= 35 && cut.tracks.length === 1 && cut.tracks[0] === "genz") score -= 1
  }
  return { score, reasons }
}

/** Every cut that fits the hard filters (texture, hairline, direction), best first. */
export function rankCuts(a: Answers, s: ShapeResult): RankedCut[] {
  return CUTS
    .map((cut) => ({ cut, r: score(cut, a, s) }))
    .filter((x) => x.r !== null)
    .map(({ cut, r }) => ({ cut, score: r!.score, reasons: r!.reasons }))
    .sort((x, y) => y.score - x.score)
}

// ─── everything else ─────────────────────────────────────────────────────────
export function grooming(a: Answers) {
  const steps: { title: string; text: string; products: Link[] }[] = [
    { title: "Skin, every day", text: "Cleanse morning and night, moisturiser with SPF 30 every morning. It's the single biggest difference to how healthy you look.", products: [product("cleanser", a), product("moisturiser-spf", a)] },
  ]
  if ((a.age ?? 0) >= 25) steps.push({ title: "Skin, a few nights a week", text: "A beginner retinol at night smooths texture and fine lines. Start twice a week.", products: [product("retinol", a)] })
  const tex = a.texture
  if (tex === "curly" || tex === "coily") steps.push({ title: "Hair care", text: "Wash 1 to 3 times a week, condition every time, and use a leave-in. Moisture is what makes curls look defined.", products: [product("leave-in", a)] })
  else steps.push({ title: "Hair care", text: "Wash every 2 to 3 days. On the days in between, rinse and condition only, so your hair holds a style better.", products: [] })
  return steps
}

export function fitNotes(a: Answers): string[] {
  const n: string[] = []
  const hc = heightClass(a)
  if (hc === "short") n.push("Keep outfits in one or two close colours, wear slightly cropped trousers and jackets that end at the hip. Avoid oversized.")
  if (hc === "tall") n.push("Layering and wider trousers work on you. Break the line with a contrasting top and bottom.")
  if (a.build === "slim") n.push("Structured jackets, heavier fabrics and layers add presence. Avoid anything clingy.")
  if (a.build === "athletic" || a.build === "broad") n.push("Tapered trousers balance your shoulders. Choose stretch fabrics and tailor the waist.")
  if (a.build === "bigger") n.push("Structured, darker pieces and vertical lines. Fit through the shoulders and let the rest drape rather than cling.")
  if (a.goal === "older") n.push("Tailored fits, darker colours, collars and leather shoes read more grown-up.")
  if (a.goal === "younger") n.push("Lighter colours, relaxed fits and sneakers read younger.")
  return n
}
