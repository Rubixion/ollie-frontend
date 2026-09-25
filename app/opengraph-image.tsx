import { INDEX } from "@/lib/facts"
import { OG_SIZE, ogCard } from "@/lib/og-card"

// Static (no request data), so it's rendered once at build time. Also used for twitter:image.
export const alt = "Ollie: which celebrity do you look like?"
export const size = OG_SIZE
export const contentType = "image/png"

export default function OGImage() {
  return ogCard(
    "Which celebrity do you look like?",
    `Upload a photo and a face-recognition model ranks ${INDEX.celebrities} celebrities by how much they look like you.`
  )
}
