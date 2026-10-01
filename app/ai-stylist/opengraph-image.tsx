import { OG_SIZE, ogCard } from "@/lib/og-card"

// The page sets its own openGraph metadata, which drops the root image, so Ollie Stylist needs its own card.
export const alt = "Ollie Stylist: a free AI stylist for your haircut and clothes"
export const size = OG_SIZE
export const contentType = "image/png"

export default function OGImage() {
  return ogCard(
    "Ollie Stylist: your free AI stylist",
    "Dress a realistic model in real clothes, and scan your face for the haircuts that suit its shape."
  )
}
