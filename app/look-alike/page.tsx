import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { TrackedLink } from "@/components/tracked-link"
import { card } from "@/lib/surfaces"
import { INDEX } from "@/lib/facts"
import { LOOK_ALIKE_LIVE, LOOK_ALIKE_UPDATED, SITE_URL } from "@/lib/site-config"
import { imgSrc, lookAlikePages, shown } from "@/lib/look-alike"

// Hub for the /look-alike/<celebrity> pages. Hidden until LOOK_ALIKE_LIVE.
// Main keyword "famous look alike" (320/mo US, KD6). "celebrity look alike" belongs to /celebrity-lookalike, so not here.
const TITLE = `Famous Look Alikes: ${lookAlikePages.length} Stars and Their AI Twins`
const DESCRIPTION = `Who looks like who? Ollie's face-recognition AI ranked the closest look alikes of ${lookAlikePages.length} famous people, from Margot Robbie to Brad Pitt.`

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/look-alike" },
  ...(LOOK_ALIKE_LIVE ? {} : { robots: { index: false, follow: false } }),
  openGraph: { type: "website", siteName: "Ollie", url: "/look-alike", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

const pages = [...lookAlikePages].sort((a, b) => a.name.localeCompare(b.name))

export default function LookAlikeHub() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/look-alike#page`,
        name: TITLE,
        description: DESCRIPTION,
        dateModified: LOOK_ALIKE_UPDATED,
        publisher: { "@id": `${SITE_URL}/#organization` },
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: pages.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: `${p.name} look alike`, url: `${SITE_URL}/look-alike/${p.slug}` })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Famous look alikes", item: `${SITE_URL}/look-alike` },
        ],
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/60 mb-7">
            <Link href="/" className="py-2.5 hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-white/50" aria-current="page">Famous look alikes</span>
          </nav>

          <header className="max-w-3xl mb-12">
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight text-balance">Famous look alikes, ranked by AI</h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed text-pretty">
              Ollie&apos;s face-recognition model compared {lookAlikePages.length} of the most searched-for celebrities with {INDEX.celebrities} others
              and ranked who looks most like whom. Pick a star to see their closest look alikes, with photos and similarity scores.
            </p>
          </header>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pages.map((p) => {
              const top = p.matches[0]
              return (
                <li key={p.slug}>
                  <Link href={`/look-alike/${p.slug}`} className={`${card} flex items-center gap-3 p-3 hover:bg-white/[0.04] transition-colors`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP */}
                    <img src={imgSrc(p.img)} alt="" width={56} height={56} loading="lazy" decoding="async" className="size-14 shrink-0 rounded-xl object-cover border border-white/10" />
                    <span className="min-w-0">
                      <span className="block font-bold text-white truncate">{p.name}</span>
                      <span className="block text-xs text-white/60 truncate">
                        looks like {top.name}, {shown(top.score)}%
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <section className={`${card} mt-16 p-6 md:p-10 text-center max-w-3xl mx-auto`}>
            <h2 className="text-2xl font-black text-white tracking-tight text-balance">Which celebrity do you look like?</h2>
            <p className="mt-3 text-white/70 leading-relaxed text-pretty">The same model ranks {INDEX.celebrities} celebrities against your own selfie. Free, and your photo is never stored.</p>
            <Button asChild variant="brand" size="cta" className="mt-6">
              <TrackedLink href="/celebrity-lookalike" event="lookalike_page_cta" params={{ celebrity: "hub" }}>
                Find your celebrity look alike <ArrowRight size={16} aria-hidden="true" />
              </TrackedLink>
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
