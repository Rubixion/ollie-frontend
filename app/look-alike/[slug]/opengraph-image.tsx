import { ogCard, OG_SIZE } from "@/lib/og-card"
import { getLookAlike, lookAlikePages } from "@/lib/look-alike"

export const size = OG_SIZE
export const contentType = "image/png"
export const alt = "Celebrity look alikes ranked by Ollie's face-recognition AI"

export function generateStaticParams() {
  return lookAlikePages.map((p) => ({ slug: p.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = getLookAlike((await params).slug)
  if (!p) return ogCard("Famous look alikes", "Celebrities ranked by face similarity")
  return ogCard(`${p.name} look alike`, `Closest celebrity: ${p.matches[0].name}. Ranked by Ollie's face-recognition AI.`)
}
