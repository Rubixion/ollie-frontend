import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { BGPattern } from "@/components/bg-pattern"
import { CelebrityFinder } from "@/components/celebrity-finder"

export const metadata = {
  title: "Celebrity Match - Ollie",
  description: "Upload your photo and discover which celebrity you resemble using Ollie's AI face matching.",
}

export default function FindPage() {
  return (
    <main className="relative min-h-screen bg-transparent">
      <BGPattern variant="grid" mask="fade-edges" fill="rgba(255,255,255,0.04)" size={32} className="fixed" />
      <Nav />

      {/* Tips — shown before the finder so users see them first */}
      <div className="pt-28 max-w-4xl mx-auto px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {[
            {
              slug: "best-photo-celebrity-match",
              title: "Best photos for matching",
              desc: "Lighting, framing, and settings that improve accuracy.",
            },
            {
              slug: "best-lighting-for-match",
              title: "Lighting guide",
              desc: "From daylight to ring lights, ranked by match quality.",
            },
            {
              slug: "improving-ollie-results",
              title: "How to improve results",
              desc: "What to avoid and what helps most.",
            },
          ].map(({ slug, title, desc }) => (
            <Link
              key={slug}
              href={`/blog/${slug}`}
              className="flex-1 block px-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/8 hover:border-white/20 hover:bg-white/[0.04] transition-all group"
            >
              <h3 className="text-xs font-bold text-white/60 group-hover:text-white/90 transition-colors leading-snug mb-1">
                {title}
              </h3>
              <p className="text-white/25 text-xs leading-relaxed">{desc}</p>
              <span className="inline-flex items-center gap-1 text-white/20 text-xs mt-2 group-hover:text-white/40 transition-colors">
                Read <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      <CelebrityFinder />

      <Footer />
    </main>
  )
}
