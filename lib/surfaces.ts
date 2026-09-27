// Borderless lit surface shared by the home, match and contact pages: a card with recessed wells inside.
const surface = "relative rounded-3xl bg-(--ollie-card) bg-linear-to-b from-white/[0.055] to-white/[0.015] shadow-[inset_0_1px_0_rgb(255_255_255/0.07)]"

export const card = `${surface} overflow-hidden`
// Same surface without clipping, for panels that hold dropdown menus
export const cardOpen = surface

// The tool panels (match, compare, kirk). Was a see-through blurred "glass"; now the same solid surface as the cards,
// so the tools read as steady app panels instead of one more effect over the dotted background.
const glassSurface = surface
export const glass = `${glassSurface} overflow-hidden`
export const glassOpen = glassSurface
