import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { FaceCompare } from "@/components/face-compare"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { card } from "@/lib/surfaces"
import { MODEL } from "@/lib/facts"
import { HOME_UPDATED, SITE_URL } from "@/lib/site-config"

// Main keyword "compare faces" (2.4k/mo US, KD18), plus "face comparison" (2.4k, KD4) and
// "compare faces online" / "compare 2 faces online" (140, KD0). Keyword data from the OpenSEO research log, 2026-09.
const DESCRIPTION = "Compare two faces online, free. Upload two photos and Ollie's face-recognition AI shows how alike they are and if they're the same person. Photos never stored."

export const metadata: Metadata = {
  title: "Compare Faces Online: Are They the Same Person?",
  description: DESCRIPTION,
  alternates: { canonical: "/compare-faces" },
  openGraph: { type: "website", siteName: "Ollie", url: "/compare-faces", title: "Compare faces online: same person?", description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: "Compare faces online: same person?", description: DESCRIPTION },
}

const STEPS: [string, string][] = [
  ["Find the faces.", "Ollie locates the face in each photo and lines it up so the eyes and mouth sit in the same place."],
  ["Turn each face into numbers.", `The face-recognition model, ${MODEL.summary}, describes each face as 512 numbers based on its shape, not on hair, makeup or background.`],
  ["Measure the distance.", "The closer the two sets of numbers, the more alike the faces. Ollie shows that as a lookalike percentage and says “Same person” when it clears the threshold the model was tuned on."],
]

// Phrased as people search them; also the FAQPage JSON-LD below
const QUESTIONS: [string, string][] = [
  [
    "How do I compare two faces online?",
    "Upload one photo of each face above and press Compare. Ollie finds both faces, measures how close they are with its face-recognition model, and tells you in a few seconds whether they look like the same person, with a lookalike percentage.",
  ],
  [
    "Can AI tell if two photos are the same person?",
    `Usually, yes. Ollie's model scores ${MODEL.lfw} on Labeled Faces in the Wild (LFW), the standard test that asks exactly this: do two photos show the same person? It's less sure with blurry photos, side profiles, heavy filters, big age gaps and identical twins.`,
  ],
  [
    "What does the lookalike percentage mean?",
    "It's a similarity score, not a probability. Photos of the same person usually land well above strangers, but the number depends on the photos too, so two pictures of you can score differently.",
  ],
  [
    "Is the face comparison free?",
    "Yes. Guests get a few free comparisons, and a free account gets more. There are no watermarks and nothing to install.",
  ],
  [
    "Are my photos stored?",
    "No. Both photos are processed in memory for this comparison and never stored, logged or used for training. The shareable result image is made on your device.",
  ],
]

const RELATED: [string, string][] = [
  ["/blog/why-same-person-different-ai-results", "Why two photos of the same person can give different results"],
  ["/blog/what-is-similarity-score", "What a similarity score actually measures"],
  ["/blog/identical-twins-different-profiles", "What face recognition does with identical twins"],
  ["/blog/siamese-neural-networks-explained", "Siamese networks: how AI compares two faces"],
]

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Ollie Compare Faces",
    url: `${SITE_URL}/compare-faces`,
    description: DESCRIPTION,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Compares two faces with Ollie's own face-recognition model",
      "Says whether the photos look like the same person",
      "Lookalike percentage for the pair",
      "Uploaded photos are never stored",
    ],
    creator: { "@type": "Organization", name: "Ollie" },
    dateModified: HOME_UPDATED,
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QUESTIONS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  },
]

export default function ComparePage() {
  return (
    <>
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <FaceCompare />

        {/* Server-rendered so crawlers, AI answer engines and no-JS visitors can read what the tool does */}
        <section aria-labelledby="how-heading" className="relative mx-auto max-w-3xl px-6 pb-24 pt-8">
          <div data-reveal="1" className={`${card} p-6 md:p-10`}>
            <p className="text-white/70 leading-relaxed text-pretty">
              Ollie compares two faces by turning each one into a set of numbers with a face-recognition model and measuring how far apart they are.
              It works on any two photos, free, and tells you if they look like the same person in a few seconds. The model scores {MODEL.lfw} on
              LFW, the standard same-person test, and your photos are never stored.
            </p>

            <h2 id="how-heading" className="mt-12 text-2xl font-black text-white tracking-tight text-balance">
              How face comparison works
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
              {QUESTIONS.map(([q, a]) => (
                <div key={q}>
                  <h3 className="text-lg font-bold text-white text-balance">{q}</h3>
                  <p className="mt-2 text-white/70 leading-relaxed text-pretty">{a}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-12 text-2xl font-black text-white tracking-tight text-balance">Read more</h2>
            <ul className="mt-6 space-y-3">
              {RELATED.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-white/70 underline underline-offset-4 decoration-white/20 hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>

            <Link href="/celebrity-lookalike" className="group mt-10 inline-flex items-center gap-2 text-(--ollie-cyan) text-sm font-semibold underline-offset-4 hover:underline">
              Now find out which celebrity you look like
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
