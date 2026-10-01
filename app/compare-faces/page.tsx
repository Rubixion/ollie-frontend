import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { FaceCompare } from "@/components/face-compare"

// Linked from the nav and footer, and in the sitemap
export const metadata: Metadata = {
  title: "Compare Faces Online: Are They the Same Person?",
  description: "Compare two faces online, free. Upload two photos and Ollie's face-recognition AI shows how alike they are and if they're the same person. Photos never stored.",
  alternates: { canonical: "/compare-faces" },
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
