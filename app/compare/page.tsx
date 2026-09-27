import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { FaceCompare } from "@/components/face-compare"

// Linked from the nav and footer, and in the sitemap
export const metadata: Metadata = {
  title: "Same Person? Compare Two Faces",
  description: "Upload two photos and Ollie tells you whether they show the same person, and how alike the two faces look. Free, photos never stored.",
  alternates: { canonical: "/compare" },
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
