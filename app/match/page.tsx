import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { CelebrityFinder } from "@/components/celebrity-finder"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TextEffect } from "@/components/ui/text-effect"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { card } from "@/lib/surfaces"
import { INDEX } from "@/lib/facts"
import { FAQ, STEPS } from "@/lib/faq"
import { HOME_UPDATED, SITE_URL } from "@/lib/site-config"

// The questions people search most, answered here too so /match explains itself; the rest are on /faq
const TOP_QUESTIONS = ["How accurate is Ollie?", "What actor or actress do I look like?", "Is Ollie free?", "Do you keep my photo?"]
  .map((q) => FAQ.find(([question]) => question === q)!)


// Worded after what people search (2026-09 keyword research): "what celebrity do I look like", "celebrity look alike",
// "what actor/actress do I look like". This is the page meant to rank for them; the home page links here.
const DESCRIPTION = `Find your celebrity look alike with AI. Upload a photo and Ollie's ML model ranks ${INDEX.celebrities} actors, actresses and stars by likeness. Free, photo never stored.`

export const metadata: Metadata = {
  title: { absolute: "What Celebrity Do I Look Like? Free Celebrity Lookalike AI" },
  description: DESCRIPTION,
  alternates: { canonical: "/match", types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "The Ollie Blog" }] } },
  openGraph: {
    type: "website",
    siteName: "Ollie",
    url: "/match",
    title: "What celebrity do I look like?",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "What celebrity do I look like?",
    description: DESCRIPTION,
  },
}

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Ollie",
    url: `${SITE_URL}/match`,
    description: DESCRIPTION,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Celebrity lookalike AI built on Ollie's own face-recognition machine learning model",
      `Ranks ${INDEX.celebrities} celebrities by facial similarity`,
      "Top five matches with credited, openly licensed photos",
      "Detects your gender from the photo by default, or lets you pick men or women",
      "Optional filter for actors, singers or footballers",
      "Uploaded photos are never stored",
      "Shareable result image made on your device",
    ],
    creator: { "@type": "Organization", name: "Ollie" },
    dateModified: HOME_UPDATED,
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  },
]

export default function MatchPage() {
  return (
    <>
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <CelebrityFinder />

        {/* Server-rendered so crawlers, AI answer engines and no-JS visitors get the explanation; the full version is /faq */}
        <section aria-labelledby="how-heading" className="relative mx-auto max-w-3xl px-6 pb-24 pt-8">
          <div data-reveal="1" className={`${card} p-6 md:p-10`}>
            <h2 id="how-heading" className="text-2xl font-black text-white tracking-tight text-balance">
              <TextEffect as="span" per="word" preset="blur" inView>How Ollie matches your face</TextEffect>
            </h2>
            <ol className="mt-6 space-y-5">
              {STEPS.map(([title, text], i) => (
                <li key={title} className="flex gap-4">
                  <span className="text-(--ollie-cyan) font-black tabular-nums leading-relaxed">{i + 1}</span>
                  <p className="text-white/70 leading-relaxed text-pretty">
                    <strong className="text-white font-semibold">{title}</strong> {text}
                  </p>
                </li>
              ))}
            </ol>

            <h2 className="mt-12 text-2xl font-black text-white tracking-tight text-balance">Common questions</h2>
            <div className="mt-6 space-y-8">
              {TOP_QUESTIONS.map(([q, a]) => (
                <div key={q}>
                  <h3 className="text-lg font-bold text-white text-balance">{q}</h3>
                  <p className="mt-2 text-white/70 leading-relaxed text-pretty">{a}</p>
                </div>
              ))}
            </div>

            <Link href="/faq" className="group mt-10 inline-flex items-center gap-2 text-(--ollie-cyan) text-sm font-semibold underline-offset-4 hover:underline">
              Photo tips, limitations, privacy and more questions
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </main>
      <Footer />
      <RevealOnScroll />
    </>
  )
}
