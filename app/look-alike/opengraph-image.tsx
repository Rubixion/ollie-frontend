import { ogCard, OG_SIZE } from "@/lib/og-card"

export const size = OG_SIZE
export const contentType = "image/png"
export const alt = "Famous look alikes ranked by Ollie's face-recognition AI"

export default function Image() {
  return ogCard("Famous look alikes", "Who looks like who, ranked by Ollie's face-recognition AI.")
}
