import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"

export const metadata = { title: "Page not found" }

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <DottedSurface className="motion-reduce:hidden" />
        <div className="max-w-xl mx-auto px-6 pt-40 pb-24">
          <p className="text-(--ollie-cyan) font-bold tabular-nums">404</p>
          <h1 className="mt-3 text-4xl font-black text-white tracking-tight text-balance">No match for this page</h1>
          <p className="mt-4 text-white/70 leading-relaxed text-pretty">
            The address may be mistyped, or the page was removed. The face matching still works.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button asChild variant="brand" size="cta" className="group">
              <Link href="/match">
                Find my match
                <ArrowRight className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" size={16} strokeWidth={2} aria-hidden="true" />
              </Link>
            </Button>
            <Link href="/blog" className="text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-white">
              Read the blog
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
