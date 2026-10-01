// The free 3D try-on: a CC0 Quaternius character (public/style/avatar/*.glb, see LICENSE.txt there) built from
// four swappable parts. Every file shares one 62-bone rig and an "Idle" clip, so a head from one file lines up
// with a body from another as long as their idle animations play in sync.
// ponytail: men's pack only. Add Quaternius' Ultimate Modular Women pack (also CC0) for a women's avatar.

export type Part = "head" | "body" | "legs" | "feet"
export const SOURCES = ["casual", "casual2", "suit", "beach", "punk", "adventurer", "worker"] as const
export type Source = (typeof SOURCES)[number]

// mesh name inside each file, per part (worker.glb has no head: its hard hat isn't a hairstyle)
const PREFIX: Record<Source, string> = {
  casual: "Casual", casual2: "Casual2", suit: "Suit", beach: "Beach", punk: "Punk", adventurer: "Adventurer", worker: "Worker",
}
export const meshName = (s: Source, p: Part) => `${PREFIX[s]}_${p[0].toUpperCase()}${p.slice(1)}`

// which material on each piece is the garment (or hair), so a product's colour can be put on it
export const GARMENT: Record<Exclude<Part, "head">, Partial<Record<Source, string[]>>> = {
  body: { casual: ["Purple"], casual2: ["LightBrown"], suit: ["Suit"], beach: ["LightBrown"], punk: ["Black"], adventurer: ["Green", "LightGreen"], worker: ["Worker_Vest", "Worker_Yellow"] },
  legs: { casual: ["LightBlue"], casual2: ["LightBlue"], suit: ["Suit"], beach: ["Red_Dark"], punk: ["LightBlue"], adventurer: ["Brown"], worker: ["Brown"] },
  feet: { casual: ["Purple"], casual2: ["Red_Dark"], suit: ["Black"], beach: ["Red_Dark"], punk: ["Black"], adventurer: ["Grey"], worker: ["Grey"] },
}
export const HAIR_MATERIALS = ["Hair", "Red"] // Red = the punk head's mohawk
export const SKIN_MATERIALS = ["Skin", "Skin_Darker"]

export const HEADS: { id: Source; label: string }[] = [
  { id: "casual", label: "Messy textured" },
  { id: "suit", label: "Classic side part" },
  { id: "beach", label: "Short and spiky" },
  { id: "casual2", label: "Medium length" },
  { id: "adventurer", label: "Long with beard" },
  { id: "punk", label: "Mohawk" },
]

// closest 3D head for each haircut in the catalogue (the AI preview shows the exact cut)
const HEAD_FOR: Record<string, Source> = {
  "side-part": "suit", quiff: "suit", pompadour: "suit", "ivy-league": "suit", "slick-back": "suit",
  buzz: "beach", crew: "beach", caesar: "beach", waves: "beach", shaved: "beach", pixie: "beach",
  curtains: "casual2", flow: "casual2", bob: "casual2", lob: "casual2", "curtain-bangs": "casual2",
  "long-tied": "adventurer", "long-layers": "adventurer", "sleek-long": "adventurer", braids: "adventurer", "sleek-bun": "adventurer", twists: "adventurer",
  "high-top": "punk",
}
export const headFor = (cutId?: string): Source => (cutId && HEAD_FOR[cutId]) || "casual"

export const SKIN_TONES = [
  { label: "Light", hex: "#f1c7a5" }, { label: "Light-medium", hex: "#dba882" }, { label: "Medium", hex: "#c08a5f" },
  { label: "Tan", hex: "#9c6a43" }, { label: "Brown", hex: "#74492c" }, { label: "Deep", hex: "#4a2e1d" },
]
export const HAIR_COLORS = [
  { label: "Black", hex: "#1b1714" }, { label: "Dark brown", hex: "#3b2719" }, { label: "Brown", hex: "#6b4a2f" },
  { label: "Blonde", hex: "#c9a56a" }, { label: "Red", hex: "#8e3b1f" }, { label: "Grey", hex: "#9a9a9a" },
]

export type Outfit = {
  head: Source
  body: Source; legs: Source; feet: Source
  colors: Partial<Record<"body" | "legs" | "feet" | "hair" | "skin", string>>
}
// what the avatar wears before anything is picked: plain tee, jeans, white sneakers
export const DEFAULT_OUTFIT: Outfit = { head: "casual", body: "casual2", legs: "casual2", feet: "casual", colors: { feet: "#f2f2ef" } }
