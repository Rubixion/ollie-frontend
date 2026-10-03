// Everything the style report recommends from. Plain data: edit freely, recommend.ts does the ranking.
import type { Shape } from "./face-shape"

export type Texture = "straight" | "wavy" | "curly" | "coily"
// "high" = a full hairline that sits high (a tall forehead): cut filters treat it as full, scoring favours a fringe
export type Hairline = "full" | "high" | "slight" | "receding" | "thinning" | "bald"
export type Track = "working" | "genz" | "classic"

export type Cut = {
  id: string
  name: string
  dir: number // -1 feminine … 0 neutral … +1 masculine
  good: Shape[]
  avoid: Shape[]
  tex: Texture[]
  hairline: Hairline[]
  height: boolean // adds height on top
  age: -1 | 0 | 1 // reads younger / neutral / older
  tracks: Track[]
  weeks: number // barber or salon visit every N weeks
  ask: string // what to tell the barber or stylist
  styling: string[]
  products: ProductId[]
}

const ALL_TEX: Texture[] = ["straight", "wavy", "curly", "coily"]

export const CUTS: Cut[] = [
  { id: "textured-crop", name: "Textured crop", dir: 0.7, good: ["oval", "oblong", "square", "diamond", "heart"], avoid: ["round"], tex: ["straight", "wavy", "curly"], hairline: ["full", "slight", "receding"], height: false, age: -1, tracks: ["genz", "working"], weeks: 3,
    ask: "Low or mid skin fade on the sides, 1 to 1.5 inches on top, point-cut for texture, short blunt fringe pushed forward.",
    styling: ["Towel dry, then a few sprays of sea salt spray.", "Blow dry forward with your fingers.", "Work a pea-sized amount of matte clay through and twist the ends."],
    products: ["sea-salt", "matte-clay", "blow-dryer"] },
  { id: "side-part", name: "Classic side part", dir: 0.8, good: ["oval", "square", "oblong", "triangle", "diamond"], avoid: [], tex: ["straight", "wavy"], hairline: ["full", "slight"], height: false, age: 1, tracks: ["working", "classic"], weeks: 4,
    ask: "Scissor cut or a #3 taper on the sides, 2 to 3 inches on top, a hard or soft part on your natural parting side.",
    styling: ["Comb the part in on damp hair.", "Blow dry the top over to the side.", "Finish with a little pomade for a clean, low-shine hold."],
    products: ["pomade", "comb", "blow-dryer"] },
  { id: "quiff", name: "Quiff", dir: 0.7, good: ["oval", "round", "square", "diamond", "triangle"], avoid: ["oblong"], tex: ["straight", "wavy"], hairline: ["full", "slight"], height: true, age: 0, tracks: ["genz", "classic"], weeks: 4,
    ask: "Short tapered sides (#2 to #3), 3 to 4 inches at the front graduating shorter to the crown.",
    styling: ["Pre-styler on damp hair.", "Blow dry the front up and back with a round brush.", "Shape with matte clay; keep it messy for casual, neater for work."],
    products: ["pre-styler", "matte-clay", "blow-dryer"] },
  { id: "pompadour", name: "Modern pompadour", dir: 0.8, good: ["oval", "round", "square"], avoid: ["oblong"], tex: ["straight", "wavy"], hairline: ["full"], height: true, age: 0, tracks: ["classic"], weeks: 3,
    ask: "Mid fade or undercut on the sides, 4 to 5 inches on top, longest at the front.",
    styling: ["Blow dry everything up and back.", "Comb through a medium-shine pomade.", "Set the shape with your hands, not the comb, for a modern finish."],
    products: ["pomade", "blow-dryer", "comb"] },
  { id: "buzz", name: "Buzz cut", dir: 0.9, good: ["oval", "square", "diamond", "oblong"], avoid: ["round"], tex: ALL_TEX, hairline: ["full", "slight", "receding", "thinning", "bald"], height: false, age: 1, tracks: ["working"], weeks: 2,
    ask: "#2 or #3 all over, or a #3 on top with a #1 fade on the sides for more shape. Line up the edges.",
    styling: ["Nothing to style. Keep the scalp moisturised and wear SPF on it in summer."],
    products: ["clippers", "moisturiser-spf"] },
  { id: "crew", name: "Crew cut", dir: 0.9, good: ["oval", "square", "oblong", "diamond", "heart"], avoid: ["round"], tex: ALL_TEX, hairline: ["full", "slight", "receding", "thinning"], height: false, age: 1, tracks: ["working", "classic"], weeks: 3,
    ask: "#2 to #3 on the sides with a taper, about an inch on top, slightly longer at the front.",
    styling: ["Towel dry.", "A small amount of matte clay pushed forward or to the side."],
    products: ["matte-clay"] },
  { id: "ivy-league", name: "Ivy League", dir: 0.8, good: ["oval", "square", "oblong", "round", "triangle"], avoid: [], tex: ["straight", "wavy"], hairline: ["full", "slight", "receding"], height: false, age: 1, tracks: ["working", "classic"], weeks: 4,
    ask: "Short tapered sides, 1.5 to 2 inches on top that is long enough to part. Keep it neat.",
    styling: ["Side part on damp hair.", "Light styling cream for a natural finish."],
    products: ["styling-cream", "comb"] },
  { id: "slick-back", name: "Slicked back", dir: 0.8, good: ["oval", "square", "diamond", "heart"], avoid: ["oblong"], tex: ["straight", "wavy"], hairline: ["full"], height: false, age: 1, tracks: ["classic", "working"], weeks: 4,
    ask: "Undercut or tapered sides, 4 inches or more on top so it reaches back.",
    styling: ["Blow dry back.", "Comb through pomade: high shine for formal, matte for everyday."],
    products: ["pomade", "comb", "blow-dryer"] },
  { id: "curtains", name: "Middle part (curtains)", dir: 0.3, good: ["oblong", "square", "oval", "triangle"], avoid: ["round", "heart"], tex: ["straight", "wavy"], hairline: ["full"], height: false, age: -1, tracks: ["genz"], weeks: 6,
    ask: "Grow the top to eyebrow or cheekbone length, part in the middle, soft taper or scissor cut on the sides.",
    styling: ["Blow dry the part in, pushing each side out and back.", "Sea salt spray for texture, or a little cream for control."],
    products: ["sea-salt", "styling-cream", "blow-dryer"] },
  { id: "fringe-taper", name: "Textured fringe with low taper", dir: 0.6, good: ["oval", "oblong", "heart", "diamond"], avoid: ["round"], tex: ["wavy", "curly"], hairline: ["full", "slight"], height: false, age: -1, tracks: ["genz"], weeks: 4,
    ask: "Low taper around the ears and neck, 3 to 4 inches on top, texturised and falling forward over the forehead.",
    styling: ["Curl cream or sea salt spray on damp hair.", "Scrunch and let it air dry or use a diffuser."],
    products: ["curl-cream", "sea-salt", "diffuser"] },
  { id: "curly-top", name: "Curly top with fade", dir: 0.7, good: ["oval", "round", "square", "diamond", "triangle"], avoid: ["oblong"], tex: ["curly", "coily"], hairline: ["full", "slight"], height: true, age: -1, tracks: ["genz", "working"], weeks: 3,
    ask: "Mid or high fade, keep 2 to 4 inches of curls on top, shaped rounder rather than tall.",
    styling: ["Leave-in conditioner on wet hair.", "Curl cream, scrunch, then leave it to dry without touching."],
    products: ["leave-in", "curl-cream", "diffuser"] },
  { id: "high-top", name: "High top", dir: 0.8, good: ["round", "square", "oval"], avoid: ["oblong"], tex: ["coily"], hairline: ["full", "slight"], height: true, age: 0, tracks: ["genz"], weeks: 2,
    ask: "Skin or low fade on the sides, the top left tall and shaped flat or slightly rounded. Sharp line-up.",
    styling: ["Pick the top up and out.", "Shape with a sponge or pick; moisturise daily."],
    products: ["leave-in", "hair-pick"] },
  { id: "twists", name: "Twists with taper", dir: 0.4, good: ["oval", "round", "square", "diamond"], avoid: [], tex: ["coily", "curly"], hairline: ["full", "slight"], height: false, age: -1, tracks: ["genz"], weeks: 6,
    ask: "Two-strand or sponge twists on top, low taper on the sides and back.",
    styling: ["Twisting cream on clean, damp hair.", "Retwist the roots every 2 to 3 weeks; sleep on a satin pillowcase or durag."],
    products: ["twist-cream", "durag"] },
  { id: "waves", name: "360 waves", dir: 0.8, good: ["oval", "round", "square", "oblong", "heart", "diamond", "triangle"], avoid: [], tex: ["coily", "curly"], hairline: ["full", "slight"], height: false, age: 0, tracks: ["working", "classic"], weeks: 2,
    ask: "Even low cut (#1 to #2) all over with a line-up; ask them to cut with the grain.",
    styling: ["Brush in the pattern twice a day with a wave brush.", "Wave pomade, then wear a durag overnight."],
    products: ["wave-brush", "durag", "wave-pomade"] },
  { id: "caesar", name: "Caesar cut", dir: 0.8, good: ["oval", "oblong", "square", "heart", "diamond"], avoid: [], tex: ALL_TEX, hairline: ["full", "slight", "receding"], height: false, age: 0, tracks: ["working", "classic"], weeks: 3,
    ask: "Short even length on top (about an inch) brushed forward to a short straight fringe, faded or tapered sides.",
    styling: ["Push forward with a little matte clay.", "Keep the fringe line straight between cuts."],
    products: ["matte-clay"] },
  { id: "flow", name: "Swept-back flow", dir: 0.5, good: ["square", "diamond", "heart", "oval"], avoid: ["oblong", "round"], tex: ["straight", "wavy"], hairline: ["full"], height: false, age: 0, tracks: ["genz", "classic"], weeks: 8,
    ask: "Grow to the ears or collar, keep weight at the ends, clean up the neckline only.",
    styling: ["Blow dry back with your fingers.", "Light cream or oil so it moves but stays tidy."],
    products: ["styling-cream", "hair-oil"] },
  { id: "long-tied", name: "Long hair, tied back", dir: 0.4, good: ["oval", "square", "diamond"], avoid: ["round", "oblong"], tex: ["straight", "wavy", "curly"], hairline: ["full"], height: false, age: 0, tracks: ["genz"], weeks: 10,
    ask: "Shoulder length or longer, trims only to remove split ends; optional undercut.",
    styling: ["Leave-in conditioner.", "Tie loosely to avoid breakage; wear down with a little texture spray."],
    products: ["leave-in", "sea-salt"] },
  { id: "shaved", name: "Clean-shaved head", dir: 0.9, good: ["oval", "square", "oblong", "diamond"], avoid: [], tex: ALL_TEX, hairline: ["receding", "thinning", "bald"], height: false, age: 1, tracks: ["working", "classic"], weeks: 1,
    ask: "Shave it yourself every few days with a head shaver; no barber needed.",
    styling: ["Shave with the grain after a shower.", "Moisturiser with SPF every morning; a matte one stops shine."],
    products: ["head-shaver", "moisturiser-spf"] },
  { id: "long-layers", name: "Long layers", dir: -0.9, good: ["oval", "round", "square", "heart", "diamond", "triangle"], avoid: [], tex: ["straight", "wavy", "curly"], hairline: ["full", "slight", "thinning"], height: false, age: -1, tracks: ["working", "classic", "genz"], weeks: 10,
    ask: "Keep the length, face-framing layers starting at the chin, long layers through the back for movement.",
    styling: ["Heat protectant, then a round-brush blow dry.", "A drop of hair oil on the ends."],
    products: ["heat-protect", "round-brush", "hair-oil"] },
  { id: "curtain-bangs", name: "Layers with curtain bangs", dir: -0.8, good: ["oblong", "heart", "square", "diamond", "oval"], avoid: ["round"], tex: ["straight", "wavy"], hairline: ["full", "slight"], height: false, age: -1, tracks: ["genz"], weeks: 6,
    ask: "Curtain bangs parted in the middle, cheekbone length, blending into long layers.",
    styling: ["Blow dry the bangs with a round brush, rolling away from your face.", "Dry shampoo at the roots on day two."],
    products: ["round-brush", "dry-shampoo", "heat-protect"] },
  { id: "lob", name: "Long bob (lob)", dir: -0.6, good: ["oval", "round", "square", "heart", "oblong"], avoid: [], tex: ["straight", "wavy", "curly"], hairline: ["full", "slight", "thinning"], height: false, age: 0, tracks: ["working", "classic"], weeks: 8,
    ask: "Collarbone length, slightly longer at the front, soft texturised ends.",
    styling: ["Loose waves with a flat iron or a texture spray.", "Tuck one side for work."],
    products: ["texture-spray", "heat-protect"] },
  { id: "bob", name: "Chin-length bob", dir: -0.6, good: ["oval", "oblong", "heart", "diamond"], avoid: ["round", "square", "triangle"], tex: ["straight", "wavy"], hairline: ["full", "slight"], height: false, age: 0, tracks: ["working", "genz"], weeks: 6,
    ask: "Chin length, blunt or lightly textured, with or without a side part.",
    styling: ["Smooth with a round brush.", "A little serum for shine."],
    products: ["round-brush", "hair-oil"] },
  { id: "pixie", name: "Pixie cut", dir: -0.4, good: ["oval", "heart", "diamond", "oblong"], avoid: ["round"], tex: ALL_TEX, hairline: ["full", "slight", "thinning"], height: false, age: 0, tracks: ["genz", "working"], weeks: 5,
    ask: "Short all over with a longer, textured top and a soft side-swept fringe.",
    styling: ["Pea-sized styling cream, messed up with your fingers."],
    products: ["styling-cream", "texture-spray"] },
  { id: "shag", name: "Shag / wolf cut", dir: -0.3, good: ["oval", "oblong", "square", "heart", "diamond"], avoid: ["round"], tex: ["straight", "wavy", "curly"], hairline: ["full", "slight"], height: false, age: -1, tracks: ["genz"], weeks: 8,
    ask: "Choppy layers throughout, short layers around the crown, curtain or wispy fringe.",
    styling: ["Sea salt spray or mousse on damp hair.", "Scrunch and air dry, or diffuse."],
    products: ["sea-salt", "diffuser"] },
  { id: "sleek-long", name: "Sleek middle part", dir: -0.8, good: ["oval", "heart", "diamond"], avoid: ["oblong", "round"], tex: ["straight"], hairline: ["full"], height: false, age: 1, tracks: ["classic", "working"], weeks: 10,
    ask: "One length, blunt ends, centre part.",
    styling: ["Heat protectant, flat iron in sections.", "Finish with hair oil."],
    products: ["heat-protect", "flat-iron", "hair-oil"] },
  { id: "defined-curls", name: "Shaped, defined curls", dir: -0.5, good: ["oval", "oblong", "square", "heart", "diamond"], avoid: [], tex: ["curly", "coily"], hairline: ["full", "slight", "thinning"], height: false, age: 0, tracks: ["working", "classic", "genz"], weeks: 10,
    ask: "A curly cut done dry, curl by curl, shaped round with layers so it doesn't go triangular.",
    styling: ["Leave-in and curl cream on soaking wet hair.", "Scrunch, then diffuse or air dry. Don't brush once dry."],
    products: ["leave-in", "curl-cream", "diffuser"] },
  { id: "tapered-afro", name: "Tapered afro", dir: 0, good: ["oval", "square", "heart", "diamond", "round"], avoid: ["oblong"], tex: ["coily"], hairline: ["full", "slight", "thinning"], height: true, age: 0, tracks: ["genz", "working"], weeks: 4,
    ask: "Short tapered sides and back, fuller rounded shape on top.",
    styling: ["Leave-in and a moisturising cream daily.", "Pick out the top for shape."],
    products: ["leave-in", "hair-pick", "twist-cream"] },
  { id: "braids", name: "Knotless braids", dir: -0.6, good: ["oval", "round", "square", "heart", "diamond", "oblong"], avoid: [], tex: ["coily", "curly"], hairline: ["full", "slight"], height: false, age: 0, tracks: ["genz", "working"], weeks: 8,
    ask: "Medium knotless braids, waist or mid-back length; no tension at the edges.",
    styling: ["Keep your scalp moisturised with a light oil.", "Sleep in a satin bonnet; take out after 6 to 8 weeks."],
    products: ["hair-oil", "satin-bonnet", "edge-control"] },
  { id: "sleek-bun", name: "Sleek low bun", dir: -0.6, good: ["oval", "heart", "diamond", "square"], avoid: ["round"], tex: ALL_TEX, hairline: ["full", "slight"], height: false, age: 1, tracks: ["working", "classic"], weeks: 10,
    ask: "Any length past the shoulders; ask for long layers so it stays healthy.",
    styling: ["Smooth back with gel or a brush.", "Low bun at the nape, edge control for a clean hairline."],
    products: ["edge-control", "hair-oil"] },
]

// ─── products ────────────────────────────────────────────────────────────────
// Small accessories (combs, brushes, durags) use the "hair" price bands; "tool" is for electricals.
// Amazon search links for now (the Associates tag makes any search result pay). Swap a query for a
// direct `url` once there are hand-picked products or other stores' affiliate links.
export type Kind = "hair" | "skin" | "tool" | "clothes" | "glasses"
export type Product = { label: string; query: string; kind: Kind; url?: string; gendered?: boolean }

export const PRICE_TIERS: Record<Kind, [number, number][]> = {
  hair: [[0, 12], [12, 25], [25, 60]],
  skin: [[0, 15], [15, 35], [35, 90]],
  tool: [[0, 30], [30, 80], [80, 300]],
  clothes: [[0, 40], [40, 100], [100, 400]],
  glasses: [[0, 25], [25, 60], [60, 250]],
}

export const PRODUCTS = {
  "matte-clay": { label: "Matte clay", query: "matte hair clay", kind: "hair" },
  "sea-salt": { label: "Sea salt spray", query: "sea salt spray hair texture", kind: "hair" },
  pomade: { label: "Pomade", query: "water based pomade", kind: "hair" },
  "styling-cream": { label: "Styling cream", query: "hair styling cream light hold", kind: "hair" },
  "pre-styler": { label: "Pre-styler", query: "hair pre styler volume", kind: "hair" },
  "curl-cream": { label: "Curl cream", query: "curl defining cream", kind: "hair" },
  "leave-in": { label: "Leave-in conditioner", query: "leave in conditioner", kind: "hair" },
  "twist-cream": { label: "Twisting cream", query: "twist cream natural hair", kind: "hair" },
  "wave-pomade": { label: "Wave pomade", query: "360 waves pomade", kind: "hair" },
  "texture-spray": { label: "Texture spray", query: "dry texture spray hair", kind: "hair" },
  "dry-shampoo": { label: "Dry shampoo", query: "dry shampoo", kind: "hair" },
  "heat-protect": { label: "Heat protectant", query: "heat protectant spray", kind: "hair" },
  "hair-oil": { label: "Hair oil", query: "lightweight hair oil", kind: "hair" },
  "edge-control": { label: "Edge control", query: "edge control", kind: "hair" },
  "blow-dryer": { label: "Hair dryer with nozzle", query: "hair dryer concentrator nozzle", kind: "tool" },
  diffuser: { label: "Diffuser", query: "hair diffuser attachment", kind: "tool" },
  "round-brush": { label: "Round brush", query: "round brush blow dry", kind: "tool" },
  "flat-iron": { label: "Flat iron", query: "flat iron hair straightener", kind: "tool" },
  comb: { label: "Styling comb", query: "wide tooth styling comb", kind: "hair" },
  "hair-pick": { label: "Hair pick", query: "afro hair pick comb", kind: "hair" },
  "wave-brush": { label: "Wave brush", query: "360 wave brush", kind: "hair" },
  durag: { label: "Durag", query: "silky durag", kind: "hair" },
  "satin-bonnet": { label: "Satin bonnet", query: "satin hair bonnet", kind: "hair" },
  clippers: { label: "Hair clippers", query: "cordless hair clippers", kind: "tool" },
  "head-shaver": { label: "Head shaver", query: "head shaver bald", kind: "tool" },
  cleanser: { label: "Gentle cleanser", query: "gentle face cleanser", kind: "skin" },
  "moisturiser-spf": { label: "Moisturiser with SPF", query: "face moisturizer spf 30", kind: "skin" },
  retinol: { label: "Retinol serum", query: "retinol serum beginner", kind: "skin" },
  "beard-trimmer": { label: "Beard trimmer", query: "beard trimmer guards", kind: "tool" },
  "beard-oil": { label: "Beard oil", query: "beard oil", kind: "skin" },
  "beard-comb": { label: "Beard comb", query: "beard comb", kind: "hair" },
  "brow-gel": { label: "Brow gel", query: "clear brow gel", kind: "skin" },
  "brow-pencil": { label: "Brow pencil", query: "eyebrow pencil fine tip", kind: "skin" },
  tweezers: { label: "Slant tweezers", query: "slant tip tweezers", kind: "hair" },
  "brow-scissors": { label: "Brow scissors", query: "eyebrow trimming scissors", kind: "hair" },
} satisfies Record<string, Product>

export type ProductId = keyof typeof PRODUCTS

// ─── editor options: brows, beards, glasses, clothes ────────────────────────
// `render` is the exact instruction the image model gets for that option (built server-side, never from the client).
// `dir` leans masculine (+) / feminine (-); options without it suit anyone.
export type Option = { id: string; name: string; sub: string; render: string; dir?: number; products?: ProductId[]; query?: string }

export const BROWS: Option[] = [
  { id: "natural", name: "Natural, tidied", sub: "Strays removed, shape kept", render: "their own eyebrows, neatly tidied with stray hairs removed, same shape and thickness", products: ["tweezers", "brow-gel"] },
  { id: "straight-full", name: "Straight and full", sub: "Low, thick, reads younger", render: "fuller, straighter eyebrows with a low, flat arch", products: ["brow-gel", "brow-pencil"] },
  { id: "clean-arch", name: "Clean, defined arch", dir: 0.5, sub: "Sharper, more alert", render: "groomed eyebrows with a subtle, clean arch and a crisp lower edge", products: ["tweezers", "brow-scissors"] },
  { id: "soft-arch", name: "Soft natural arch", dir: -0.5, sub: "Gentle lift, balanced", render: "softly arched, natural-looking eyebrows, slightly fuller at the front", products: ["brow-pencil", "brow-gel"] },
  { id: "laminated", name: "Brushed-up, fluffy", dir: -0.5, sub: "Laminated look", render: "fluffy, brushed-up eyebrows with a laminated look", products: ["brow-gel"] },
  { id: "high-arch", name: "Defined high arch", dir: -0.8, sub: "Polished, glam", render: "precisely shaped eyebrows with a defined high arch", products: ["brow-pencil", "tweezers"] },
]

// best brow ids per face shape, first = top pick: curves soften angles and width, straighter brows shorten a long face
export const BROW_FOR: Record<Shape, string[]> = {
  oval: ["natural", "soft-arch"], round: ["clean-arch", "high-arch"], square: ["soft-arch", "natural"], oblong: ["straight-full", "natural"],
  heart: ["soft-arch", "natural"], diamond: ["soft-arch", "straight-full"], triangle: ["clean-arch", "high-arch"],
}

// cuts with hair falling over the forehead: they hide a high or receding hairline
export const FRINGE = new Set(["textured-crop", "caesar", "fringe-taper", "curtain-bangs", "pixie", "shag", "crew"])
// cuts that pull hair up or back off the forehead: they show more of it
export const OFF_FOREHEAD = new Set(["slick-back", "pompadour", "quiff", "flow", "sleek-bun", "sleek-long"])

export const BEARD_STYLES: Option[] = [
  { id: "clean", name: "Clean-shaven", sub: "Smooth, reads younger", render: "a clean-shaven face with no facial hair", products: ["moisturiser-spf"] },
  { id: "stubble", name: "Light stubble", sub: "2 to 3 days of growth", render: "light, even two-to-three-day stubble", products: ["beard-trimmer"] },
  { id: "heavy-stubble", name: "Heavy stubble", sub: "About a week, rugged", render: "heavy, well-shaped one-week stubble with a clean neckline", products: ["beard-trimmer"] },
  { id: "boxed", name: "Short boxed beard", sub: "Tight cheeks, tidy lines", render: "a short, neatly boxed beard with a clean cheek line and neckline", products: ["beard-trimmer", "beard-oil", "beard-comb"] },
  { id: "full", name: "Full beard", sub: "Fuller, reads older", render: "a full, well-groomed beard about an inch long", products: ["beard-trimmer", "beard-oil", "beard-comb"] },
  { id: "circle", name: "Circle beard", sub: "Moustache and chin only", render: "a neat circle beard: moustache joined to a short chin beard, clean-shaven cheeks", products: ["beard-trimmer"] },
]

// best beard ids per face shape, first = top pick
export const BEARD_FOR: Record<Shape, string[]> = {
  oval: ["boxed", "heavy-stubble"], round: ["boxed", "circle"], square: ["full", "circle"], oblong: ["heavy-stubble", "stubble"],
  heart: ["full", "boxed"], diamond: ["full", "boxed"], triangle: ["stubble", "heavy-stubble"],
}
export const BEARD_NOTES: Record<Shape, string> = {
  oval: "Almost anything works: stubble to a short boxed beard. Keep the cheek line clean.",
  round: "A short boxed beard, longer at the chin and tight on the cheeks, lengthens your face.",
  square: "A rounded full beard or circle beard softens a strong jaw.",
  oblong: "Keep it short and fuller at the sides so it doesn't add length.",
  heart: "Fuller at the chin to add width to your lower face.",
  diamond: "A fuller beard fills out the chin and jaw to balance wide cheekbones.",
  triangle: "Light stubble with tight sides, so your jaw doesn't look wider.",
}

export const GLASSES: Option[] = [
  { id: "none", name: "No glasses", sub: "As you are", render: "no glasses" },
  { id: "rectangle", name: "Rectangle frames", sub: "Angular, adds structure", render: "thin black rectangle eyeglasses", query: "rectangle eyeglasses frames" },
  { id: "square", name: "Square frames", sub: "Bold, confident", render: "black square acetate eyeglasses", query: "square eyeglasses frames" },
  { id: "round", name: "Round frames", sub: "Softens angles", render: "round thin metal eyeglasses", query: "round eyeglasses frames" },
  { id: "oval", name: "Oval frames", sub: "Subtle, easy", render: "slim oval eyeglasses", query: "oval eyeglasses frames" },
  { id: "browline", name: "Browline frames", sub: "Classic, lifts the brow", render: "tortoiseshell browline eyeglasses", query: "browline glasses frames" },
  { id: "aviator", name: "Aviators", sub: "Balances a wide forehead", render: "thin gold aviator eyeglasses with clear lenses", query: "aviator eyeglasses frames" },
  { id: "cat-eye", name: "Cat-eye frames", dir: -0.5, sub: "Lifts and widens the eyes", render: "black cat-eye eyeglasses", query: "cat eye glasses frames" },
  { id: "oversized", name: "Tall oversized frames", sub: "Shortens a long face", render: "tall oversized clear-lens eyeglasses", query: "oversized square eyeglasses frames" },
]

export const GLASSES_FOR: Record<Shape, string[]> = {
  oval: ["square", "browline"], round: ["rectangle", "square"], square: ["round", "oval"], oblong: ["oversized", "aviator"],
  heart: ["aviator", "round"], diamond: ["oval", "cat-eye"], triangle: ["browline", "cat-eye"],
}

export type Style = "classic" | "old-money" | "streetwear" | "minimal" | "workwear" | "techwear" | "y2k" | "preppy" | "athleisure"
export const STYLES: Record<Style, { label: string; blurb: string }> = {
  classic: { label: "Clean classic", blurb: "Navy, white, grey. Fits that never date." },
  "old-money": { label: "Old money", blurb: "Knitwear, pleats, loafers, quiet colours." },
  streetwear: { label: "Streetwear", blurb: "Heavy cotton, relaxed fits, statement sneakers." },
  minimal: { label: "Minimal", blurb: "Few colours, good fabric, no logos." },
  workwear: { label: "Rugged / workwear", blurb: "Canvas, flannel, boots, built to last." },
  techwear: { label: "Techwear", blurb: "Technical fabrics, black, functional details." },
  y2k: { label: "Gen-Z / Y2K", blurb: "Baggy denim, retro sneakers, playful layers." },
  preppy: { label: "Preppy", blurb: "Oxford cloth, stripes, boat shoes." },
  athleisure: { label: "Athleisure", blurb: "Gym-to-street, clean and comfortable." },
}

export type Slot = "top" | "outer" | "bottom" | "shoes"
// Real products (found 2026-09-30 on each brand's own site). Prices only where the brand's page showed one.
// Photo for the try-on and the card: public/style/products/<id>.jpg (front-on product shot, plain background).
// ponytail: plain brand links; swap `url` for affiliate links (Amazon / Awin / Rakuten / Impact) once approved.
// `for`: only rendered and offered on that gender's model (unset = both). `long`: outerwear past the hip (Choose for me
// leans to it for Plus builds). `age`: reads younger (-1) / older (+1), for the "look older / younger" presets.
export type Gender = "male" | "female"
// A real colourway of a product. `drawn`: the colour its layer was rendered in (shown as is); every other colour is
// recoloured from the layer in the browser (lib/style/recolor.ts), unless `layer` names a layer rendered in that colour.
// The first colour is the default. An item whose rendered colour is no longer sold has no `drawn` colour.
export type Color = { name: string; hex: string; layer?: string; drawn?: boolean; url?: string } // url: that colour's own product page
// `colors`: only colours the brand really sells, and only for solid-colour pieces (no denim, plaid, stripes).
// `shape`: reuse another item's layer (same cut, e.g. two fitted crew-neck long-sleeves), tinted to this item's colour:
// a new product with a shape we already have costs no image calls.
type More = { for?: Gender; long?: boolean; age?: -1 | 0 | 1; colors?: Color[]; shape?: string }
// `usd`: the brand's price when the page showed one, else EST (typical US list price, for budgets and "about $X"
// totals only, never shown as the price). ponytail: hand-set; refresh when a feed with live prices is wired in.
export type Item = Option & More & { slot: Slot; styles: Style[]; brand: string; url: string; price?: string; usd: number }
const EST: Record<string, number> = {
  "champion-rw-hoodie": 70, "uniqlo-u-tee": 20, "levis-trucker": 98, "carhartt-michigan": 198,
  "uniqlo-uld-vest": 60, "jcrew-ludlow": 298, "levis-501": 80, "levis-501-black": 80, "uniqlo-chino": 40, "uniqlo-merino-mock": 40,
  "carhartt-flannel": 55, "uniqlo-merino-crew": 40, "jcrew-cashmere-w": 148, "babaton-contour-crew": 58, "jcrew-oxford-w": 80,
  "bdg-baby-tee": 25, "uniqlo-chesterfield": 230, "babaton-agency-blazer": 248, "aritzia-super-puff": 250, "levis-578-baggy": 80,
  "uniqlo-smart-ankle": 50, "on-cloudmonster": 180, "sam-edelman-loraine": 150, "uniqlo-merino-polo": 50, "uniqlo-dress-shirt": 40,
  "levis-511-dark": 90, "jcrew-lodge-w": 300,
}
// Real colourways per item (see Color above). Uniqlo's are from its product API; the rest from brand pages, 2026-10-03.
// Only solid-colour pieces: denim, plaid, stripes and two-tone jackets would need a render per colour.
const COLORS: Record<string, Color[]> = {
  "uniqlo-u-tee": [{ name: "White", hex: "#f0efed", drawn: true }, { name: "Black", hex: "#1f1e22", layer: "uniqlo-u-tee-black" }, { name: "Gray 03", hex: "#e3dbd8" }, { name: "Gray 07", hex: "#444651" }, { name: "Cream", hex: "#f4ebdb" }, { name: "Beige", hex: "#bdb793" }, { name: "Brown", hex: "#9e855c" }, { name: "Dark Brown", hex: "#61493f" }, { name: "Red", hex: "#9e4e4a" }, { name: "Pink", hex: "#d9cbc0" }, { name: "Green", hex: "#a9b3ab" }, { name: "Blue 66", hex: "#60617f" }, { name: "Blue 67", hex: "#40506c" }, { name: "Purple", hex: "#9c7f8b" }],
  "uniqlo-merino-crew": [{ name: "Navy", hex: "#272736", drawn: true }, { name: "Black", hex: "#252327" }, { name: "Dark Gray", hex: "#423c39" }, { name: "Gray 06", hex: "#46464b" }, { name: "Gray 03", hex: "#97979c" }],
  "uniqlo-merino-mock": [{ name: "Black", hex: "#232224", drawn: true }, { name: "Navy", hex: "#282739" }, { name: "Gray 06", hex: "#48474a" }, { name: "Gray 03", hex: "#9f9ea3" }, { name: "Red", hex: "#791f35" }],
  "uniqlo-merino-polo": [{ name: "Black", hex: "#202022", drawn: true }, { name: "Navy", hex: "#2a2b3f" }, { name: "Wine", hex: "#54273b" }, { name: "Gray", hex: "#8c9293" }, { name: "Beige", hex: "#b59977" }],
  "uniqlo-dress-shirt": [{ name: "White", hex: "#f0f0f4", drawn: true }, { name: "Black", hex: "#1f1f21" }],
  "uniqlo-uld-vest": [{ name: "Navy", hex: "#2b3044", drawn: true }, { name: "Black", hex: "#222226" }, { name: "Olive", hex: "#5d6858" }, { name: "Brown", hex: "#a69c80" }, { name: "Light Gray", hex: "#d1dbdc" }],
  "uniqlo-chesterfield": [{ name: "Black", hex: "#252429" }, { name: "Navy", hex: "#20242d" }, { name: "Brown", hex: "#aa845d" }],
  "uniqlo-chino": [{ name: "Beige", hex: "#b7ab9e", drawn: true }, { name: "Navy", hex: "#21212d" }, { name: "Black", hex: "#1d1b1c" }, { name: "Olive", hex: "#4a4c3f" }, { name: "Dark Green", hex: "#36352f" }, { name: "Gray 05", hex: "#7a706e" }, { name: "Gray 07", hex: "#525357" }, { name: "Off White", hex: "#e9e5e2" }],
  "uniqlo-smart-ankle": [{ name: "Navy", hex: "#363c48", drawn: true }, { name: "Black", hex: "#2d2f2f" }, { name: "Gray", hex: "#5e6264" }, { name: "Beige", hex: "#bbb298" }],
  "uniqlo-smart-ankle-w": [{ name: "Black", hex: "#2e302f", drawn: true }, { name: "Gray", hex: "#787881" }, { name: "Beige", hex: "#bdad94" }, { name: "Natural", hex: "#ede5da" }, { name: "Yellow", hex: "#f7e8c7" }],
  "uniqlo-pleated-wide": [{ name: "Gray", hex: "#68686e", drawn: true }, { name: "Black", hex: "#29282b" }, { name: "Navy", hex: "#34333d" }, { name: "Dark Brown", hex: "#554e4b" }, { name: "Beige", hex: "#d2c2a9" }],
  "champion-rw-hoodie": [{ name: "Black", hex: "#1c1c1e", drawn: true }, { name: "Oxford Grey", hex: "#9a9a9c" }, { name: "Navy", hex: "#1f2638" }, { name: "Oatmeal Heather", hex: "#cfc4b0" }, { name: "White", hex: "#f2f2f0" }],
  "nike-club-crew": [{ name: "Dark Grey Heather", hex: "#4a4a4c", drawn: true }, { name: "Black", hex: "#1c1c1c" }, { name: "Obsidian", hex: "#24283a" }, { name: "University Blue", hex: "#9ec5e8" }],
  "carhartt-k87": [{ name: "Carhartt Brown", hex: "#8b5a2b", drawn: true }, { name: "Black", hex: "#1c1c1c" }, { name: "Navy", hex: "#1f2a3d" }, { name: "Heather Grey", hex: "#b5b5b3" }, { name: "Dark Olive", hex: "#4a4b37" }, { name: "Port", hex: "#5a2430" }, { name: "Desert", hex: "#c9b18c" }, { name: "White", hex: "#f2f2f0" }],
  "lacoste-polo": [{ name: "Navy Blue", hex: "#1d2340", drawn: true }, { name: "White", hex: "#f4f4f2" }, { name: "Black", hex: "#1a1a1a" }, { name: "Pine Green", hex: "#1f3d2e" }, { name: "Bordeaux", hex: "#5c1f2b" }],
  "rl-oxford": [{ name: "Blue", hex: "#a9c4e3", drawn: true }, { name: "White", hex: "#f4f4f2" }, { name: "Faded Mint", hex: "#bcd6c6" }, { name: "Nutmeg Brown", hex: "#8a6a4e" }],
  "rl-quarter-zip": [{ name: "Andover Cream", hex: "#ece3cf", drawn: true }, { name: "Fawn Grey Heather", hex: "#b7b2aa" }, { name: "Camel Melange", hex: "#b8936a" }, { name: "Polo Black", hex: "#1c1c1c" }],
  "jcrew-cable-knit": [{ name: "Ivory", hex: "#ece4d3", drawn: true }, { name: "Darkest Indigo Navy", hex: "#1f2a44" }],
  "nike-tech-hoodie": [{ name: "Black", hex: "#1c1c1c", drawn: true }, { name: "Dark Grey Heather", hex: "#5a5a5c" }, { name: "Obsidian", hex: "#24283a" }],
  "jcrew-cashmere-w": [{ name: "Heather Oatmeal", hex: "#d8cbb5", drawn: true }, { name: "Black", hex: "#1c1c1c" }, { name: "Navy", hex: "#1f2638" }, { name: "Ash Grey", hex: "#b8b6b2" }, { name: "Utility Green", hex: "#6b6e4e" }],
  "babaton-contour-crew": [{ name: "Black", hex: "#151515", drawn: true }, { name: "White", hex: "#f2f0ec" }, { name: "Matte Pearl", hex: "#e6ded2" }, { name: "Deep Taupe", hex: "#7d6c62" }, { name: "Rich Mocha", hex: "#4a3328" }],
  "lululemon-align-tank": [{ name: "Black", hex: "#151515", drawn: true }, { name: "White", hex: "#f2f2f0" }, { name: "True Navy", hex: "#232b44" }, { name: "Bone", hex: "#e6dcc8" }, { name: "Espresso", hex: "#3b2a24" }, { name: "Dark Olive", hex: "#4a4b37" }],
  "jcrew-jackie": [{ name: "Ivory", hex: "#efe8da", drawn: true }, { name: "Black", hex: "#1c1c1c" }, { name: "Navy", hex: "#1f2638" }],
  "alpha-ma1": [{ name: "Sage", hex: "#8a9a7b", drawn: true }, { name: "Black", hex: "#1a1a1a" }, { name: "Replica Blue", hex: "#2b3346" }, { name: "Gunmetal", hex: "#5a5d5e" }, { name: "Midnight Teal", hex: "#1f3a3d" }],
  "patagonia-torrentshell": [{ name: "Black", hex: "#161616", drawn: true }, { name: "Smolder Blue", hex: "#3c4e66" }, { name: "Noble Grey", hex: "#5e625f" }],
  "jcrew-ludlow": [{ name: "Navy", hex: "#1f2638", drawn: true }, { name: "Grey", hex: "#6e6e70" }],
  "carhartt-michigan": [{ name: "Hamilton Brown", hex: "#8b5a2b", drawn: true }, { name: "Black", hex: "#1c1c1c" }],
  "baracuta-g9": [{ name: "Dark Navy", hex: "#1c2233", drawn: true }, { name: "Black", hex: "#1a1a1a", url: "https://us.baracuta.com/products/baracuta-g9-harrington-jacket-brcps1123bcnyz-100" }, { name: "Racing Green", hex: "#1f3a2c", url: "https://us.baracuta.com/products/baracuta-g9-harrington-jacket-brcps3001ut3124-6368" }, { name: "Army", hex: "#4f5236", url: "https://us.baracuta.com/products/baracuta-g9-harrington-jacket-brcps1123bcnyz-6097" }, { name: "Slate Grey", hex: "#5d6266", url: "https://us.baracuta.com/products/baracuta-g9-harrington-jacket-brcps3001ut3124-139" }, { name: "Tan", hex: "#b08a5c", url: "https://us.baracuta.com/products/baracuta-g9-harrington-jacket-brcps3001ut3124-710" }, { name: "Brown Cigar", hex: "#5a3e2b", url: "https://us.baracuta.com/products/baracuta-g9-harrington-jacket-brcps3001ut3124-7010" }, { name: "Natural", hex: "#d9cdb4", url: "https://us.baracuta.com/products/baracuta-g9-harrington-jacket-brcps3001ut3124-818" }, { name: "Tawny Port", hex: "#5e2630", url: "https://us.baracuta.com/products/baracuta-g9-harrington-jacket-brcps3001ut3124-5318" }],
  "dickies-874": [{ name: "Khaki", hex: "#b5a27c", drawn: true }, { name: "Black", hex: "#1c1c1c" }, { name: "Dark Navy", hex: "#1f2433" }, { name: "Charcoal", hex: "#46484b" }, { name: "Dark Brown", hex: "#4a3a2e" }, { name: "Olive Green", hex: "#5a5b3c" }],
  "nike-tech-jogger": [{ name: "Black", hex: "#1c1c1c", drawn: true }, { name: "Dark Grey Heather", hex: "#5a5a5c" }, { name: "Obsidian", hex: "#24283a" }],
  "carhartt-wip-cargo": [{ name: "Black", hex: "#1c1c1c", drawn: true }, { name: "Cypress", hex: "#5d5f43" }, { name: "Leather", hex: "#8a6a4b" }, { name: "Graphite", hex: "#5b5c5e" }],
  "converse-chuck-70": [{ name: "Black", hex: "#1c1c1c", drawn: true }, { name: "Parchment", hex: "#e8e0cc" }],
  "dr-martens-1460": [{ name: "Black Smooth", hex: "#151515", drawn: true }, { name: "Cherry Red", hex: "#5e1a1c" }],
  "clarks-desert-boot": [{ name: "Beeswax", hex: "#8a5a32", drawn: true }, { name: "Sand Suede", hex: "#c7a37a" }, { name: "Brown Suede", hex: "#5a3e2c" }, { name: "Cola Suede", hex: "#6b4630" }, { name: "Black Suede", hex: "#2a2827" }],
}
const item = (slot: Slot, id: string, brand: string, name: string, colorName: string, styles: Style[], url: string, render: string, price?: string, more: More = {}): Item =>
  ({ slot, id, brand, name: `${brand} ${name}`, styles, url, render, price, sub: [colorName, price].filter(Boolean).join(" · "), usd: price ? Number(price.replace(/[^\d.]/g, "")) : EST[id] ?? NaN, ...(COLORS[id] && { colors: COLORS[id] }), ...more })

// "Choose for me" budgets: the most a piece may cost in each slot (Premium has no cap and leans to the dearer piece)
export type Budget = 1 | 2 | 3
export const BUDGETS: Record<Budget, { label: string; cap?: Record<Slot, number> }> = {
  1: { label: "Budget", cap: { top: 50, outer: 150, bottom: 70, shoes: 110 } },
  2: { label: "Mid-range", cap: { top: 130, outer: 350, bottom: 160, shoes: 220 } },
  3: { label: "Premium" },
}
const M: More = { for: "male" }, W: More = { for: "female" }

export const ITEMS: Item[] = [
  item("top", "champion-rw-hoodie", "Champion", "Reverse Weave Hoodie", "Black", ["streetwear", "athleisure"],
    "https://www.champion.com/products/champion-reverse-weave-small-c-hooded-sweatshirt-black", "a black Champion Reverse Weave heavyweight pullover hoodie", undefined, { age: -1 }),
  // was the Uniqlo U tee, no longer sold in white or black (2026-10-03); the plain Crew Neck T-Shirt is the same cut
  item("top", "uniqlo-u-tee", "Uniqlo", "Crew Neck T-Shirt", "White", ["minimal", "classic"],
    "https://www.uniqlo.com/us/en/products/E422992-000/00", "a plain white heavyweight Uniqlo U crew-neck t-shirt", "$19.90"),
  item("outer", "levis-trucker", "Levi's", "Trucker Jacket", "Medium wash", ["streetwear", "y2k", "workwear"],
    "https://www.levi.com/US/en_US/clothing/men/outerwear/trucker-jacket/p/723340130", "a Levi's Trucker Jacket in medium-wash blue denim with metal buttons and chest pockets"),
  item("outer", "alpha-ma1", "Alpha Industries", "MA-1 Bomber (Heritage)", "Sage", ["streetwear", "classic"],
    "https://www.alphaindustries.com/products/mjm21000c1-ma-1-bomber-jacket-heritage", "an Alpha Industries MA-1 nylon bomber jacket in sage green with ribbed collar and cuffs", "$200"),
  item("outer", "carhartt-michigan", "Carhartt WIP", "Michigan Chore Coat", "Hamilton brown", ["workwear", "minimal"],
    "https://us.carhartt-wip.com/en-us/collections/men-jackets-michigan-chore-coat", "a Carhartt WIP Michigan chore coat in brown canvas with a corduroy collar and patch pockets", undefined, { long: true }),
  item("outer", "patagonia-torrentshell", "Patagonia", "Torrentshell 3L Jacket", "Black", ["techwear", "athleisure"],
    "https://www.patagonia.com/torrentshell/", "a black Patagonia Torrentshell 3L waterproof rain shell jacket with a hood", "$189", { long: true }),
  item("outer", "uniqlo-uld-vest", "Uniqlo", "Ultra Light Down Vest", "Navy", ["minimal", "athleisure"],
    "https://www.uniqlo.com/us/en/products/E472294-000/00", "a navy Uniqlo Ultra Light Down quilted puffer vest"),
  item("outer", "jcrew-ludlow", "J.Crew", "Ludlow Unstructured Blazer", "Navy", ["classic", "old-money", "preppy"],
    "https://www.jcrew.com/p/mens/categories/clothing/blazers/casual-blazers/ludlow-slim-fit-unstructured-blazer-in-italian-wool-blend/AO686", "a navy J.Crew Ludlow slim-fit unstructured wool blazer", undefined, { ...M, age: 1 }),
  item("bottom", "levis-501", "Levi's", "501 Original Jeans", "Medium wash", ["classic", "minimal", "streetwear"],
    "https://www.levi.com/US/en_US/clothing/men/jeans/straight/501-original-mens-jeans/p/005010193", "Levi's 501 straight-leg jeans in medium-wash blue denim"),
  item("bottom", "levis-501-black", "Levi's", "501 Original Fit Jeans", "Black", ["streetwear", "minimal"],
    "https://www.levi.com/US/en_US/clothing/men/jeans/straight/501-original-fit-mens-jeans/p/005013610", "black Levi's 501 straight-leg jeans"),
  item("bottom", "dickies-874", "Dickies", "874 Work Pants", "Khaki", ["workwear", "streetwear"],
    "https://www.dickies.com/en-us/collections/874-work-pants", "khaki Dickies 874 straight-leg twill work pants", "from $29.99"),
  item("bottom", "uniqlo-chino", "Uniqlo", "Slim-Fit Chino Pants", "Beige", ["classic", "preppy", "old-money"],
    "https://www.uniqlo.com/us/en/products/E422370-000/00", "beige Uniqlo slim-fit chino trousers"),
  item("shoes", "converse-chuck-70", "Converse", "Chuck 70 High Top", "Black canvas", ["streetwear", "y2k", "classic"],
    "https://www.converse.com/shop/p/chuck-70-canvas-unisex-high-top-shoe/162056MP.html", "black canvas Converse Chuck 70 high-top sneakers with white soles", "$95", { age: -1 }),
  item("shoes", "adidas-stan-smith", "adidas", "Stan Smith", "White / green", ["classic", "minimal"],
    "https://www.adidas.com/us/men-stan_smith-shoes", "white leather adidas Stan Smith sneakers with a green heel tab", "$100"),
  item("shoes", "dr-martens-1460", "Dr. Martens", "1460 Boots", "Black smooth leather", ["workwear", "streetwear"],
    "https://www.drmartens.com/us/en/unisex/originals-boots-and-shoes/boots/1460-lace-up-boots/c/06015600", "black smooth-leather Dr. Martens 1460 8-eye lace-up boots with yellow welt stitching", "$180"),

  // ── added 2026-10-01: every style covered for both genders (found on each brand's own site) ──
  // tops, both
  item("top", "uniqlo-merino-mock", "Uniqlo", "Extra Fine Merino Mock Neck Sweater", "Black", ["techwear", "minimal"],
    "https://www.uniqlo.com/us/en/products/E438787-000/00", "a slim black fine-knit merino wool mock-neck long-sleeve sweater", undefined, { age: 1 }),
  item("top", "carhartt-k87", "Carhartt", "K87 Heavyweight Pocket T-Shirt", "Carhartt brown", ["workwear", "streetwear"],
    "https://www.carhartt.com/product/K87/loose-fit-heavyweight-short-sleeve-pocket-t-shirt", "a loose-fit brown heavyweight cotton Carhartt K87 t-shirt with a left chest pocket and a small square Carhartt patch", "from $19.99"),
  item("top", "carhartt-flannel", "Carhartt", "Heavyweight Flannel Plaid Shirt", "Red / black plaid", ["workwear"],
    "https://www.carhartt.com/product/107013/loose-fit-heavyweight-flannel-long-sleeve-plaid-shirt", "a loose-fit red and black plaid heavyweight cotton flannel shirt, buttoned, with two flap chest pockets"),
  item("top", "saint-james-breton", "Saint James", "Minquiers Breton Shirt", "Ecru / navy", ["preppy", "minimal", "classic"],
    "https://us.saint-james.com/products/minquiers-modern-authentic-breton-stripe-shirt-soft-cotton-men-fit-ecru-navy", "an ecru and navy horizontally striped Breton boat-neck long-sleeve cotton shirt", "$139"),
  item("top", "nike-club-crew", "Nike", "Sportswear Club Fleece Crew", "Dark grey heather", ["y2k", "athleisure", "streetwear"],
    "https://www.nike.com/t/sportswear-club-fleece-mens-crew-TWcqLw", "a dark grey heather Nike Club fleece crew-neck sweatshirt with a small white embroidered swoosh on the left chest", "$60", { age: -1 }),
  // tops, men
  item("top", "rl-oxford", "Polo Ralph Lauren", "Classic Fit Oxford Shirt", "Blue", ["preppy", "old-money", "classic"],
    "https://www.ralphlauren.com/men-clothing-button-down-shirts/classic-fit-oxford-shirt-/639388.html", "a light blue Polo Ralph Lauren button-down oxford cotton shirt with a small embroidered pony on the chest, buttoned, untucked", "$120", { ...M, age: 1 }),
  item("top", "jcrew-cable-knit", "J.Crew", "Heritage Cotton Cable-Knit Sweater", "Ivory", ["old-money", "preppy"],
    "https://www.jcrew.com/p/mens/categories/clothing/sweaters/crewneck/heritage-cotton-cable-knit-sweater/CO474", "an ivory chunky cotton cable-knit crewneck sweater", "$118", { ...M, age: 1 }),
  item("top", "lacoste-polo", "Lacoste", "L.12.12 Original Polo", "Navy", ["preppy", "classic", "old-money"],
    "https://lacoste.com/us/lacoste/men/clothing/L1212-51-166.html", "a navy blue Lacoste L.12.12 petit pique cotton polo shirt with a small green crocodile logo on the chest", "$115", M),
  item("top", "uniqlo-merino-crew", "Uniqlo", "Extra Fine Merino Crew Neck Sweater", "Navy", ["classic", "old-money", "minimal"],
    "https://www.uniqlo.com/us/en/products/E429066-000/00", "a navy fine-knit merino wool crew-neck long-sleeve sweater", undefined, { ...M, age: 1 }),
  item("top", "nike-tech-hoodie", "Nike", "Tech Fleece Windrunner Hoodie", "Black", ["athleisure", "techwear", "streetwear"],
    "https://www.nike.com/t/sportswear-tech-fleece-windrunner-mens-full-zip-hoodie-rznlBf", "a black Nike Tech Fleece full-zip hoodie, zipped up, with the hood down", "$145", { ...M, age: -1 }),
  item("top", "lululemon-metal-vent", "lululemon", "Metal Vent Tech Short-Sleeve Shirt", "Black", ["athleisure"],
    "https://shop.lululemon.com/p/men-ss-tops/Metal-Vent-Tech-Relaxed-Fit-Short-Sleeve-Shirt/_/prod11870202", "a black lululemon Metal Vent Tech relaxed-fit short-sleeve athletic t-shirt", "$78", M),
  item("top", "arcteryx-cormac", "Arc'teryx", "Cormac Crew Neck Shirt", "Black", ["techwear", "athleisure"],
    "https://arcteryx.com/us/en/shop/mens/cormac-crew-neck-shirt-ss-0292", "a black Arc'teryx Cormac technical waffle-knit short-sleeve crew-neck t-shirt with a small Arc'teryx logo", "$70", M),
  // tops, women
  item("top", "jcrew-cashmere-w", "J.Crew", "Cashmere Classic-Fit Crewneck", "Heather oatmeal", ["old-money", "classic", "minimal"],
    "https://www.jcrew.com/p/womens/categories/clothing/sweaters/crewneck/cashmere-classic-fit-crewneck-sweater/BA400", "an oatmeal heather cashmere classic-fit crewneck sweater", undefined, { ...W, age: 1 }),
  // crew neck, not the square neck: the female base's sports bra showed inside a square neckline on every look
  item("top", "babaton-contour-crew", "Babaton", "Contour Crew Longsleeve Bodysuit", "Black", ["minimal", "classic"],
    "https://www.aritzia.com/us/en/product/contour-crew-longsleeve-bodysuit/79672.html", "a black fitted high crew-neck long-sleeve bodysuit, smooth and seamless, tucked into the trousers so the waistband shows", undefined, { ...W, age: 1 }),
  item("top", "lululemon-align-tank", "lululemon", "Align Tank Top", "Black", ["athleisure"],
    "https://shop.lululemon.com/p/women-tanks/Align-Tank-MD/_/prod9980085", "a black fitted lululemon Align racerback tank top", "$68", { ...W, age: -1 }),
  item("top", "jcrew-oxford-w", "J.Crew", "Classic-Fit Oxford Shirt", "White", ["preppy", "classic", "old-money"],
    "https://www.jcrew.com/p/womens/categories/clothing/shirts-and-tops/classic-fit-oxford-cotton-shirt/AW254", "a white classic-fit button-down oxford cotton shirt, buttoned, untucked", undefined, { ...W, age: 1 }),
  item("top", "bdg-baby-tee", "BDG", "Baby Tee", "White", ["y2k", "streetwear"],
    "https://www.urbanoutfitters.com/womens-tops?style=Baby+Tees", "a white slim cropped cotton baby tee with short sleeves", undefined, { ...W, age: -1 }),
  // outerwear, both
  item("outer", "tnf-nuptse", "The North Face", "1996 Retro Nuptse Jacket", "Black", ["streetwear", "y2k"],
    "https://www.thenorthface.com/en-us/p/mens/mens-jackets-and-vests/mens-insulated-and-down-300771/mens-1996-retro-nuptse-jacket-NF0A3C8D", "a black The North Face 1996 Retro Nuptse boxy puffer down jacket with oversized baffles", "$380", { age: -1 }),
  // outerwear, men
  item("outer", "barbour-bedale", "Barbour", "Classic Bedale Wax Jacket", "Olive", ["old-money", "classic", "preppy"],
    "https://www.barbour.com/us/classic-bedale%C2%AE-waxed-jacket-MWX0010OL7148.html", "an olive waxed-cotton Barbour Bedale jacket with a brown corduroy collar and flap pockets", "$425", { ...M, age: 1 }),
  item("outer", "carhartt-detroit", "Carhartt", "J01 Detroit Jacket", "Carhartt brown", ["workwear", "streetwear"],
    "https://www.carhartt.com/product/103828/iconic-j01-duck-detroit-jacket", "a brown Carhartt Detroit cotton duck canvas work jacket with a brown corduroy collar", "$129.99", M),
  item("outer", "arcteryx-beta", "Arc'teryx", "Beta AR Jacket", "Black", ["techwear"],
    "https://arcteryx.com/us/en/shop/mens/beta-ar-jacket-1062", "a black Arc'teryx Beta AR Gore-Tex hard-shell jacket with a hood and a small Arc'teryx logo on the chest", "$650", M),
  item("outer", "nike-windrunner", "Nike", "Windrunner Hooded Jacket", "Black / white", ["athleisure", "y2k"],
    "https://www.nike.com/t/sportswear-windrunner-mens-hooded-jacket-5hK13x", "a black Nike Windrunner hooded jacket with the white chevron panel across the chest", "$100", { ...M, age: -1 }),
  item("outer", "uniqlo-chesterfield", "Uniqlo", "Wool Cashmere Chesterfield Coat", "Charcoal", ["classic", "old-money", "minimal"],
    "https://www.uniqlo.com/us/en/products/E470082-000/00", "a charcoal grey wool-cashmere single-breasted Chesterfield overcoat, knee length", undefined, { ...M, long: true, age: 1 }),
  // outerwear, women
  item("outer", "jcrew-trench-w", "J.Crew", "Icon Trench Coat", "Vintage khaki", ["classic", "old-money", "preppy"],
    "https://www.jcrew.com/p/womens/categories/clothing/coats-and-jackets/rain-jacket/icon-trench-coat/BF456", "a khaki double-breasted cotton trench coat, knee length, belt tied loosely", "$348", { ...W, long: true, age: 1 }),
  item("outer", "babaton-agency-blazer", "Babaton", "Agency Blazer", "Black", ["classic", "minimal", "old-money"],
    "https://www.aritzia.com/us/en/product/agency-blazer/73982.html", "a black relaxed single-breasted wool blazer with notch lapels", undefined, { ...W, age: 1 }),
  item("outer", "lululemon-define", "lululemon", "Define Jacket Nulu", "Black", ["athleisure"],
    "https://shop.lululemon.com/p/jackets-and-hoodies-jackets/Define-Jacket-Nulu/_/prod11020769", "a black slim-fit lululemon Define zip-up athletic jacket", "$138", W),
  item("outer", "aritzia-super-puff", "Aritzia", "The Super Puff Shorty", "Black", ["streetwear", "y2k", "techwear"],
    "https://www.aritzia.com/us/en/product/the-super-puff%E2%84%A2-shorty/126365.html", "a black matte hip-length puffer jacket with horizontal baffles", undefined, { ...W, age: -1 }),
  item("outer", "patagonia-better-sweater-w", "Patagonia", "Better Sweater Fleece Jacket", "Oatmeal heather", ["workwear", "minimal", "athleisure"],
    "https://www.patagonia.com/product/womens-better-sweater-fleece-jacket/25543.html", "an oatmeal heather Patagonia Better Sweater full-zip fleece jacket", "$169", W),
  // bottoms, men
  item("bottom", "levis-578-baggy", "Levi's", "578 Baggy Jeans", "Light wash", ["y2k", "streetwear"],
    "https://www.levi.com/US/en_US/clothing/men/jeans/loose/578TM-baggy-mens-jeans/p/A47500022", "light-wash blue Levi's 578 extra baggy jeans stacking at the ankle", undefined, { ...M, age: -1 }),
  item("bottom", "carhartt-b01", "Carhartt", "B01 Double-Front Work Pant", "Carhartt brown", ["workwear", "streetwear"],
    "https://www.carhartt.com/product/106679/iconic-b01-firm-duck-double-front-dungaree", "brown Carhartt double-knee duck canvas loose straight work pants", "$64.99", M),
  item("bottom", "uniqlo-pleated-wide", "Uniqlo", "Pleated Wide Pants", "Grey", ["old-money", "minimal"],
    "https://www.uniqlo.com/us/en/products/E462197-000/00", "grey pleated wide-leg tailored trousers with a soft drape", "$59.90", { ...M, age: 1 }),
  item("bottom", "uniqlo-smart-ankle", "Uniqlo", "Smart Ankle Pants", "Navy", ["classic", "minimal", "preppy"],
    "https://www.uniqlo.com/us/en/products/E482886-000/00", "navy slim tapered ankle-length smart trousers with a pressed crease", undefined, { ...M, age: 1 }),
  item("bottom", "arcteryx-gamma", "Arc'teryx", "Gamma Pant", "Black", ["techwear"],
    "https://arcteryx.com/us/en/shop/mens/gamma-pant-0481", "black Arc'teryx Gamma softshell technical trousers, slim straight leg", "$200", M),
  item("bottom", "nike-tech-jogger", "Nike", "Tech Fleece Joggers", "Black", ["athleisure", "techwear"],
    "https://www.nike.com/t/sportswear-tech-fleece-mens-joggers-fsTgRP", "black Nike Tech Fleece slim joggers with tall ribbed cuffs", "$125", { ...M, age: -1 }),
  // bottoms, women
  item("bottom", "levis-ribcage", "Levi's", "Ribcage Straight Ankle Jeans", "Medium wash", ["classic", "streetwear", "minimal"],
    "https://www.levi.com/US/en_US/clothing/women/jeans/straight/ribcage-straight-ankle-womens-jeans/p/726930117", "medium-wash blue Levi's Ribcage super high-rise straight ankle jeans", "$110", W),
  item("bottom", "levis-baggy-dad", "Levi's", "Baggy Dad Jeans", "Light wash", ["y2k", "streetwear"],
    "https://www.levi.com/US/en_US/clothing/women/jeans/loose/baggy-dad-womens-jeans/p/A34940012", "light-wash blue Levi's Baggy Dad loose jeans stacking at the ankle", "$118", { ...W, age: -1 }),
  item("bottom", "babaton-effortless", "Babaton", "The Effortless Pant", "Black", ["old-money", "minimal", "classic"],
    "https://www.aritzia.com/us/en/product/the-effortless-pant%E2%84%A2/77775.html", "black high-rise pleated wide-leg tailored trousers, floor length", "$148", { ...W, age: 1 }),
  item("bottom", "lululemon-groove-flare", "lululemon", "Groove Super-High-Rise Flared Pant", "Black", ["athleisure", "y2k"],
    "https://shop.lululemon.com/p/womens-leggings/Groove-Pant-Flare-Nulu/_/prod9820425", "black lululemon Groove super-high-rise flared yoga pants", "$118", W),
  item("bottom", "uniqlo-smart-ankle-w", "Uniqlo", "Smart Ankle Pants", "Black", ["classic", "preppy", "minimal"],
    "https://www.uniqlo.com/us/en/products/E479298-000/00", "black slim tapered ankle-length smart trousers", "$39.90", { ...W, age: 1 }),
  item("bottom", "arcteryx-gamma-w", "Arc'teryx", "Gamma Pant", "Black", ["techwear"],
    "https://arcteryx.com/us/en/shop/womens/gamma-pant-0033", "black Arc'teryx Gamma softshell technical trousers, slim straight leg", "$200", W),
  // shoes, both
  item("shoes", "nb-550", "New Balance", "550", "White / green", ["y2k", "preppy", "streetwear"],
    "https://www.newbalance.com/550/", "white leather New Balance 550 low-top sneakers with green N logos", "$109.99", { age: -1 }),
  item("shoes", "nike-af1", "Nike", "Air Force 1 '07", "White", ["streetwear", "y2k"],
    "https://www.nike.com/t/air-force-1-07-mens-shoes-XVPIszaq/CW2288-111", "all-white leather Nike Air Force 1 low sneakers", "$115", { age: -1 }),
  item("shoes", "adidas-samba", "adidas", "Samba OG", "Black / white / gum", ["streetwear", "y2k", "minimal"],
    "https://www.adidas.com/us/samba-og-shoes/JS3832.html", "black leather adidas Samba OG sneakers with white three stripes and gum soles", "$100"),
  item("shoes", "salomon-xt6", "Salomon", "XT-6", "Black", ["techwear", "athleisure"],
    "https://www.salomon.com/en-us/product/xt-6-lg4239/L41086600", "all-black Salomon XT-6 trail sneakers", "$185"),
  item("shoes", "veja-campo", "VEJA", "Campo Leather", "White / natural", ["minimal", "classic"],
    "https://www.veja-store.com/en_us/p/campo-leather-white-natural-natural-CP0503147.html", "white leather VEJA Campo low-top sneakers with a tonal V logo", "$175"),
  item("shoes", "on-cloudmonster", "On", "Cloudmonster", "All black", ["athleisure"],
    "https://www.on.com/en-us/products/cloudmonster-61/mens/all-black-shoes-61.99025", "all-black On Cloudmonster running shoes with chunky cloud-pod soles"),
  item("shoes", "redwing-iron-ranger", "Red Wing Heritage", "Iron Ranger 8111", "Amber harness", ["workwear", "classic"],
    "https://www.redwingheritage.com/us/USD/product/mens-footwear/6-inch-boots/6-amber-8111-08111", "amber-brown leather Red Wing Iron Ranger lace-up boots with a toe cap, trousers over the boot shafts", "$349.99", { age: 1 }),
  // shoes, men (low shoes are drawn with socks, so the base model's own sneakers never show around them)
  item("shoes", "bass-weejuns", "G.H. Bass", "Larson Weejuns Penny Loafer", "Burgundy", ["old-money", "preppy", "classic"],
    "https://www.ghbass.com/collections/larson", "burgundy leather G.H. Bass penny loafers worn with navy socks", "$195", { ...M, age: 1 }),
  item("shoes", "sperry-ao", "Sperry", "Authentic Original Boat Shoe", "Tan", ["preppy"],
    "https://www.sperry.com/products/authentic-original-2-eye-boat-shoe-tan-14086738", "tan leather Sperry Authentic Original 2-eye boat shoes worn with white socks", "$110", M),
  item("shoes", "clarks-desert-boot", "Clarks Originals", "Desert Boot", "Beeswax", ["classic", "minimal", "old-money"],
    "https://www.clarks.com/en-us/desert-boot/26155484-p", "brown beeswax leather Clarks desert boots with crepe soles", "$140", { ...M, age: 1 }),
  // shoes, women
  item("shoes", "sam-edelman-loraine", "Sam Edelman", "Loraine Bit Loafer", "Black leather", ["old-money", "classic", "preppy"],
    "https://www.samedelman.com/product/womens-loraine-bit-loafer-3016088", "black leather horsebit loafers worn with black socks", undefined, { ...W, age: 1 }),
  item("shoes", "dr-martens-jadon", "Dr. Martens", "Jadon Platform Boots", "Black smooth leather", ["streetwear", "y2k", "workwear"],
    "https://www.drmartens.com/us/en/jadon-boot-smooth-leather-platforms-black/p/15265001", "black smooth-leather Dr. Martens Jadon platform lace-up boots", "$210", W),

  // ── added 2026-10-03: the pieces the "Dress for…" goals were missing (leather jacket, camel coat, quarter-zip,
  // knit polo, dress shirt, dress shoes, Chelsea boots, dark slim denim, cargo). No cami: the female base's sports bra
  // would show around thin straps.
  // both
  item("shoes", "blundstone-500", "Blundstone", "Original 500 Chelsea Boot", "Stout brown", ["workwear", "classic", "minimal"],
    "https://www.blundstone.com/products/stout-brown-premium-leather-v-cut-boots-mens-style-500", "stout brown leather Blundstone 500 Chelsea boots with brown elastic side panels, trousers over the boot shafts", "$209.95", { age: 1 }),
  item("shoes", "cp-achilles", "Common Projects", "Original Achilles Low", "White", ["minimal", "old-money", "classic"],
    "https://www.endclothing.com/us/common-projects-original-achilles-low-1528-0506.html", "minimal all-white leather Common Projects Achilles low-top sneakers with small gold serial numbers on the heel", "$415"),
  // men
  item("top", "rl-quarter-zip", "Polo Ralph Lauren", "Cable-Knit Cotton Quarter-Zip Sweater", "Cream", ["old-money", "preppy", "classic"],
    "https://www.ralphlauren.com/men-clothing-sweaters/cable-knit-cotton-quarter-zip-sweater/546194.html", "a cream cable-knit cotton quarter-zip sweater with a stand collar, zip half open, with a small embroidered pony on the chest", "$150", { ...M, age: 1 }),
  item("top", "uniqlo-merino-polo", "Uniqlo", "Merino Polo Sweater", "Black", ["old-money", "minimal", "classic"],
    "https://www.uniqlo.com/us/en/products/E460939-000/00", "a black fine-knit merino wool long-sleeve knitted polo sweater with an open collar, top button undone", undefined, { ...M, age: 1 }),
  item("top", "uniqlo-dress-shirt", "Uniqlo", "Easy Care Stretch Slim Shirt", "White", ["classic", "minimal", "preppy"],
    "https://www.uniqlo.com/us/en/products/E467451-000/00", "a crisp white slim-fit cotton dress shirt with a regular collar, buttoned, no tie, neatly tucked into the trousers", undefined, { ...M, age: 1 }),
  item("outer", "allsaints-milo", "AllSaints", "Milo Leather Biker Jacket", "Black", ["streetwear", "minimal", "classic"],
    "https://www.allsaints.com/us/men/leathers/leather-jackets/milo-leather-biker-jacket/USML025N-5.html", "a black slim-fit leather biker jacket with an asymmetric silver zip and notched lapels", "$649", M),
  item("outer", "baracuta-g9", "Baracuta", "G9 Harrington Jacket", "Dark navy", ["classic", "preppy", "old-money"],
    "https://us.baracuta.com/products/baracuta-g9-harrington-jacket-brcps3001ut3124-300", "a dark navy Baracuta G9 Harrington cotton jacket with a two-button stand collar, ribbed cuffs and hem, and red tartan lining showing at the collar", "$499", { ...M, age: 1 }),
  item("bottom", "levis-511-dark", "Levi's", "511 Slim Fit Jeans", "Dark wash", ["classic", "minimal", "preppy"],
    "https://www.levi.com/US/en_US/jeans-by-fit-number/men/jeans/511TM/511TM-slim-fit-mens-jeans/p/045115025", "dark indigo Levi's 511 slim-fit jeans with a clean, even wash", undefined, M),
  item("bottom", "carhartt-wip-cargo", "Carhartt WIP", "Regular Cargo Pant", "Black", ["streetwear", "y2k", "techwear", "workwear"],
    "https://us.carhartt-wip.com/en-us/products/regular-cargo-pant-black-rinsed-309", "black ripstop Carhartt WIP regular-fit cargo trousers with side cargo pockets", "$158", { ...M, age: -1 }),
  item("shoes", "ae-park-avenue", "Allen Edmonds", "Park Avenue Cap-Toe Oxford", "Black", ["classic", "old-money"],
    "https://www.allenedmonds.com/product/mens-park-avenue-cap-toe-oxford-dress-shoe-3023014/black-leather-ec4001390", "polished black leather cap-toe Oxford dress shoes worn with black socks", "$395", { ...M, age: 1 }),
  // women
  item("top", "jcrew-jackie", "J.Crew", "Jackie Cardigan", "Ivory", ["preppy", "old-money", "classic"],
    "https://www.jcrew.com/p/womens/categories/clothing/sweaters/cardigan/jackie-cardigan/CJ755", "an ivory fine-knit fitted crewneck cardigan, fully buttoned, worn as a top", "$128", { ...W, age: 1 }),
  item("outer", "allsaints-balfern-w", "AllSaints", "Balfern Leather Biker Jacket", "Black", ["streetwear", "minimal", "y2k"],
    "https://www.allsaints.com/us/women/leather/leather-jackets/balfern-leather-biker-jacket/USW084LB-5.html", "a black soft leather biker jacket with an asymmetric silver zip, press-stud lapels, shoulder epaulettes, zipped cuffs and a belted hem", "$619", W),
  item("outer", "jcrew-lodge-w", "J.Crew", "Lodge Coat in Italian Stadium-Cloth Wool", "Camel", ["old-money", "classic", "minimal"],
    "https://www.jcrew.com/p/womens/categories/clothing/coats-and-jackets/topcoat/lodge-coat-in-italian-stadium-cloth-wool/K0896", "a camel wool single-breasted topcoat, thigh length", undefined, { ...W, long: true, age: 1 }),
  item("bottom", "levis-501-90s-w", "Levi's", "501 '90s Jeans", "Dark wash", ["classic", "minimal", "streetwear"],
    "https://www.levi.com/US/en_US/clothing/women/jeans/straight/501-90s-womens-jeans/p/A19590059", "dark-wash blue Levi's 501 '90s mid-rise loose straight-leg jeans", "$110", W),
]

// ─── "Dress for…" presets: hand-picked outfits for the things people actually ask for ─────────────────
// Ids must exist in ITEMS; the editor drops any piece that has no layer for the current model and fills the gap
// with Choose for me (chooseOutfit in model.ts).
export type OccasionId = "older" | "younger" | "interview" | "date" | "taller" | "slimmer" | "broader"
type Fit = Partial<Record<Slot, string>>
// `builds`: swaps for one body type (slim / average / athletic / plus), laid over the gender's outfit
export const OCCASIONS: Record<OccasionId, { label: string; blurb: string; style: Style; male: Fit; female: Fit; notes: string[]; builds?: Record<string, { male?: Fit; female?: Fit }> }> = {
  older: {
    label: "Look older", blurb: "Collars, wool, leather. Reads 5 years older.", style: "old-money",
    male: { top: "uniqlo-merino-polo", outer: "uniqlo-chesterfield", bottom: "uniqlo-smart-ankle", shoes: "bass-weejuns" },
    female: { top: "jcrew-cashmere-w", outer: "jcrew-lodge-w", bottom: "babaton-effortless", shoes: "sam-edelman-loraine" },
    builds: { slim: { male: { outer: "barbour-bedale" } } }, // a waxed jacket adds the bulk a slim frame lacks
    notes: ["Structure reads older: a collar, a tailored trouser and leather shoes do most of the work.", "Darker, quieter colours. Skip big logos and chunky sneakers."],
  },
  younger: {
    label: "Look younger", blurb: "Relaxed fits, lighter colours, sneakers.", style: "y2k",
    male: { top: "nike-club-crew", outer: "tnf-nuptse", bottom: "levis-578-baggy", shoes: "nb-550" },
    female: { top: "bdg-baby-tee", outer: "aritzia-super-puff", bottom: "levis-baggy-dad", shoes: "nike-af1" },
    builds: { plus: { male: { outer: "levis-trucker" }, female: { top: "uniqlo-u-tee", outer: "levis-trucker" } } }, // a puffer adds bulk
    notes: ["Relaxed fits, lighter washes and clean sneakers read younger.", "Keep one fitted piece so it looks chosen, not borrowed."],
  },
  interview: {
    label: "Job interview", blurb: "Sharp but not stiff. Works for most offices.", style: "classic",
    male: { top: "uniqlo-dress-shirt", outer: "jcrew-ludlow", bottom: "uniqlo-smart-ankle", shoes: "ae-park-avenue" },
    female: { top: "jcrew-oxford-w", outer: "babaton-agency-blazer", bottom: "uniqlo-smart-ankle-w", shoes: "sam-edelman-loraine" },
    notes: ["A blazer over a plain shirt is the safe middle for most interviews: dress one step above the team.", "Navy, white and grey. Nothing that needs explaining."],
  },
  date: {
    label: "First date", blurb: "Effortless, a little sharp. Fits most places.", style: "minimal",
    male: { top: "uniqlo-merino-mock", outer: "allsaints-milo", bottom: "levis-511-dark", shoes: "blundstone-500" },
    female: { top: "babaton-contour-crew", outer: "allsaints-balfern-w", bottom: "levis-501-90s-w", shoes: "dr-martens-jadon" },
    notes: ["Dark jeans, one good knit or fitted top and a leather jacket: put together without looking like you tried too hard.", "One interesting piece is enough."],
  },
  taller: {
    label: "Look taller", blurb: "One colour head to toe, a little heel.", style: "minimal",
    male: { top: "uniqlo-merino-mock", outer: "uniqlo-chesterfield", bottom: "levis-501-black", shoes: "dr-martens-1460" },
    female: { top: "babaton-contour-crew", outer: "babaton-agency-blazer", bottom: "babaton-effortless", shoes: "dr-martens-jadon" },
    notes: ["One unbroken colour from collar to shoes makes one long line, so the eye doesn't stop at the waist.", "A boot with a stacked sole adds an honest inch or more; keep trousers long enough to cover the shaft."],
  },
  slimmer: {
    label: "Look slimmer", blurb: "Dark colours, an open long layer.", style: "classic",
    male: { top: "uniqlo-merino-crew", outer: "uniqlo-chesterfield", bottom: "uniqlo-smart-ankle", shoes: "clarks-desert-boot" },
    female: { top: "uniqlo-merino-mock", outer: "jcrew-lodge-w", bottom: "uniqlo-smart-ankle-w", shoes: "sam-edelman-loraine" },
    builds: { slim: { male: { outer: "jcrew-ludlow" } } },
    notes: ["An open coat or blazer draws two vertical lines down the body: the strongest slimming trick there is.", "Dark, matte fabrics that skim rather than cling. Avoid big horizontal stripes and shiny puffers."],
  },
  broader: {
    label: "Broader shoulders", blurb: "Width up top, a taper below.", style: "classic",
    male: { top: "saint-james-breton", outer: "alpha-ma1", bottom: "levis-511-dark", shoes: "nike-af1" },
    female: { top: "saint-james-breton", outer: "babaton-agency-blazer", bottom: "levis-501-90s-w", shoes: "veja-campo" },
    builds: { plus: { male: { top: "uniqlo-merino-crew", outer: "levis-trucker" } } }, // stripes and a puffy bomber widen everywhere
    notes: ["Detail at the shoulders (stripes, chest pockets, a bomber's rib) widens the top half; a slimmer trouser makes the V.", "Ribbed cuffs and hem gather the jacket at the waist, which reads as a taper."],
  },
}

