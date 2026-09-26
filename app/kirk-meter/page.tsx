import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { KirkMeter } from "@/components/kirk-meter"

// Hidden page: not linked anywhere, not in the sitemap, kept out of search results.
export const metadata: Metadata = {
  title: "The Kirk Meter",
  robots: { index: false, follow: false },
}

export default function KirkMeterPage() {
  return (
    <>
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <KirkMeter />
      </main>
      <Footer />
    </>
  )
}
