import Link from "next/link"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { BGPattern } from "@/components/bg-pattern"

export const metadata = { title: "Page not found" }

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <BGPattern variant="grid" mask="fade-edges" fill="rgba(255,255,255,0.04)" size={32} className="fixed" />
        <div className="max-w-xl mx-auto px-6 pt-40 pb-24">
          <p className="text-(--ollie-cyan) font-bold tabular-nums">404</p>
          <h1 className="mt-3 text-4xl font-black text-white tracking-tight text-balance">No match for this page</h1>
          <p className="mt-4 text-white/70 leading-relaxed text-pretty">
            The address may be mistyped, or the page was removed. The face matching still works.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/match"
              className="rounded-xl bg-(--ollie-cyan) px-5 py-3 text-sm font-bold text-black hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"
            >
              Find my match
            </Link>
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
