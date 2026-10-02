import { ogCard, OG_SIZE } from "@/lib/og-card"

export const size = OG_SIZE
export const contentType = "image/png"
export const alt = "Ollie's free face symmetry test"

export default function Image() {
  return ogCard("Face symmetry test", "How symmetrical is your face? Compared with thousands of real faces.")
}
