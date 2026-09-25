// Borderless lit surface shared by the home, match and contact pages: a card with recessed wells inside.
const surface = "relative rounded-3xl bg-(--ollie-card) bg-linear-to-b from-white/[0.055] to-white/[0.015] shadow-[inset_0_1px_0_rgb(255_255_255/0.07)]"

export const card = `${surface} overflow-hidden`
// Same surface without clipping, for panels that hold dropdown menus
export const cardOpen = surface

// Softer, see-through version for the match tool: the dotted background shows through instead of a solid block
const glassSurface = "relative rounded-3xl bg-linear-to-b from-white/[0.05] to-white/[0.01] backdrop-blur-sm shadow-[inset_0_1px_0_rgb(255_255_255/0.07)]"
export const glass = `${glassSurface} overflow-hidden`
export const glassOpen = glassSurface
