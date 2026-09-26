import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { FaceCompare } from "@/components/face-compare"

// Hidden page: not linked anywhere, not in the sitemap, kept out of search results.
export const metadata: Metadata = {
  title: "Same Person?",
  robots: { index: false, follow: false },
}

export default function ComparePage() {
  return (
    <>
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <FaceCompare />
      </main>
      <Footer />
    </>
  )
}
