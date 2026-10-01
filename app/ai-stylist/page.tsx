import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { StyleAdvisor } from "@/components/style-advisor"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { card } from "@/lib/surfaces"
import { PRICES } from "@/lib/style/plans"
import { SITE_URL, STYLIST_UPDATED } from "@/lib/site-config"

// Ollie Stylist, launched 2026-10-01. Main search: "ai stylist" (880/mo US, KD 13). Plan: docs/STYLE-ADVISOR-PLAN.md.
// Camera permission and the scanner's CSP are opened for /ai-stylist only (next.config.ts).
const usd = PRICES.USD
const DESCRIPTION = "Ollie Stylist is a free AI stylist. Dress a realistic model in real clothes, scan your face for haircuts that suit its shape, and shop every piece."

export const metadata: Metadata = {
  title: { absolute: "Free AI Stylist for Haircuts & Outfits | Ollie Stylist" },
  description: DESCRIPTION,
  alternates: { canonical: "/ai-stylist" },
  openGraph: { type: "website", siteName: "Ollie", url: "/ai-stylist", title: "Ollie Stylist: your free AI stylist", description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: "Ollie Stylist: your free AI stylist", description: DESCRIPTION },
}

const STEPS: [string, string][] = [
  ["Set up your model.", "Pick a gender, one of 6 looks, one of 4 body types and your height. The model is AI-made, so it never uses your photo."],
  ["Dress it.", "Try real clothes from the catalogue, or tap Choose for me to get a full outfit in one of 9 styles, from clean classic to streetwear."],
  ["Scan your face.", "In the Hair & face tab, a scan in your browser estimates which of 7 face shapes you have and ranks the haircuts, beards and glasses that suit it."],
  ["Shop the look.", "Every piece links to a shop, so you can buy what you liked."],
]

// Phrased the way people search; answers match what the tool really does (lib/style/*, components/style-*).
const FAQ: [string, string][] = [
  ["What is an AI stylist?", "An AI stylist suggests clothes and haircuts that suit you and shows how they look before you buy or book. Ollie Stylist does this in your browser: you dress a realistic model set to your look and body type, and a face scan recommends haircuts for your face shape."],
  ["Is Ollie Stylist free?", `Yes. Dressing the model, the face scan, haircut picks, shop links and 3 Choose for me outfits a day are free. Ollie Pro adds every haircut and outfit tried on your own photo, brow shapes and unlimited Choose for me, for US$${usd.monthly} a month, US$${usd.yearly} a year or US$${usd.lifetime} once. Prices show in your local currency.`],
  ["What haircut suits my face shape?", "It depends on whether your face is oval, round, square, oblong, heart, diamond or triangle shaped. The face scan measures your proportions and scores each haircut against every shape your face could be, not only the most likely one, because one photo can't pin a face shape down exactly."],
  ["Can I try clothes and haircuts on my own photo?", "Yes, with Ollie Pro. The free model shows how clothes fit a body like yours; Pro tries the haircut or outfit on your own photo using Google's Gemini image model."],
  ["Is my photo uploaded or saved?", "The face scan runs in your browser and nothing from it is uploaded. The free model never uses your photo. A Pro preview sends your photo to Google's Gemini only after you tick the box, Gemini is asked not to store it, and Ollie doesn't save it."],
]

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Ollie Stylist",
    url: `${SITE_URL}/ai-stylist`,
    description: DESCRIPTION,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Ollie Pro monthly", price: String(usd.monthly), priceCurrency: "USD" },
    ],
    featureList: [
      "Dress a realistic AI model in real clothes, set to your look, body type and height",
      "Choose for me: full outfits in 9 styles",
      "Face shape scan in the browser with haircut, beard and glasses picks",
      "Shop links for every piece",
      "Ollie Pro: try haircuts and outfits on your own photo",
    ],
    dateModified: STYLIST_UPDATED,
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  },
]

export default function StylePage() {
  return (
    <>
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent px-6 pt-[clamp(5rem,11svh,7rem)] pb-16">
        <div className="mb-[clamp(0.75rem,3svh,1.75rem)] text-center">
          <h1 className="fluid-h1-sm font-black text-white tracking-[-0.015em] leading-[1.05] text-balance">Ollie Stylist: your free AI stylist</h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/70 text-base leading-relaxed text-pretty">
            Find the haircut and clothes that suit you. Dress a realistic model in real clothes, set to your look and body type, for free. Scan your face for haircuts that suit its shape, or try every look on your own photo with Ollie Pro.
          </p>
        </div>
        <StyleAdvisor />
        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-white/50 text-pretty">
          The face scan runs in your browser and nothing from it is uploaded. The model never uses your photo. Pro previews send your photo to Google&apos;s Gemini only after you tick the box. Nothing is saved.
        </p>

        {/* Server-rendered so crawlers, AI answer engines and no-JS visitors get the explanation (same layout as /celebrity-lookalike) */}
        <section aria-labelledby="how-heading" className="relative mx-auto max-w-3xl pb-8 pt-16">
          <div data-reveal="1" className={`${card} p-6 md:p-10`}>
            <h2 id="how-heading" className="text-2xl font-black text-white tracking-tight text-balance">
              How Ollie Stylist works
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
              {FAQ.map(([q, a]) => (
                <div key={q}>
                  <h3 className="text-lg font-bold text-white text-balance">{q}</h3>
                  <p className="mt-2 text-white/70 leading-relaxed text-pretty">{a}</p>
                </div>
              ))}
            </div>

            <Link href="/blog/face-shape-guide" className="group mt-10 inline-flex items-center gap-2 text-(--ollie-cyan) text-sm font-semibold underline-offset-4 hover:underline">
              Read the face shape guide
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
