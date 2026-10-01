import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { StyleAdvisor } from "@/components/style-advisor"

// Hidden page: not linked anywhere, not in the sitemap, kept out of search results.
// Plan: docs/STYLE-ADVISOR-PLAN.md. Camera permission and the scanner's CSP are opened for /ai-stylist only (next.config.ts).
export const metadata: Metadata = {
  title: "Style scan",
  robots: { index: false, follow: false },
}

export default function StylePage() {
  return (
    <>
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent px-6 pt-[clamp(5rem,11svh,7rem)] pb-16">
        <div className="mb-[clamp(0.75rem,3svh,1.75rem)] text-center">
          <h1 className="fluid-h1-sm font-black text-white tracking-[-0.015em] leading-[1.05] text-balance">Find the haircut and style that suit you</h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/70 text-base leading-relaxed text-pretty">
            Dress a realistic model in real clothes, set to your look and body type, for free. Scan your face for haircuts that suit you, or try every look on your own photo with Ollie Pro.
          </p>
        </div>
        <StyleAdvisor />
        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-white/50 text-pretty">
          The face scan runs in your browser and nothing from it is uploaded. The model never uses your photo. Pro previews send your photo to Google&apos;s Gemini only after you tick the box. Nothing is saved.
        </p>
      </main>
      <Footer />
    </>
  )
}
