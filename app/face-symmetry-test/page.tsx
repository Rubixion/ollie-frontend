import type { Metadata } from "next"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { SymmetryTest } from "@/components/symmetry-test"
import { card } from "@/lib/surfaces"
import { SITE_URL, SYMMETRY_LIVE, SYMMETRY_UPDATED } from "@/lib/site-config"
import { MAX_YAW, NORMS_N } from "@/lib/symmetry"
import norms from "@/lib/symmetry-norms.json"

// Hidden until SYMMETRY_LIVE. Main keyword "face symmetry test" (5.4k/mo US, KD23), plus "symmetrical face test",
// "facial symmetry test", "face analysis" (4.4k, KD0). The blog post /blog/symmetrical-faces keeps "symmetrical face".
// Deliberately no attractiveness score: symmetry is measured and ranked, never rated as beauty.
const FACES = `${Math.floor(NORMS_N / 100) * 100}+`
// Typical leftover after mirroring, as a share of the distance between the eyes (median of the reference faces)
const TYPICAL = Math.round(norms.quantiles.overall[norms.quantiles.pct.indexOf(50)] * 1000) / 10
const TITLE = "Face Symmetry Test: How Symmetrical Is Your Face? (Free)"
const DESCRIPTION = `Free face symmetry test. Upload a selfie to see how symmetrical your face is next to ${FACES} real faces. Runs on your device; your photo is never uploaded.`

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/face-symmetry-test" },
  ...(SYMMETRY_LIVE ? {} : { robots: { index: false, follow: false } }),
  openGraph: { type: "website", siteName: "Ollie", url: "/face-symmetry-test", title: "Face symmetry test: how symmetrical is your face?", description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: "Face symmetry test: how symmetrical is your face?", description: DESCRIPTION },
}

const STEPS: [string, string][] = [
  ["Map the face.", "Google's MediaPipe face model places 478 points on your face, in your browser. Nothing is sent to a server."],
  ["Mirror it.", "Each point on one side is paired with its twin on the other. The face is flipped and laid back over itself in the best possible fit, which cancels out a tilted head."],
  ["Measure what's left.", `How far the paired points still miss each other is your asymmetry, overall and for your eyes, brows, nose, mouth and jaw. It's ranked against ${FACES} straight-on photos of real faces, so 70 means more symmetric than 70% of them.`],
]

const QUESTIONS: [string, string][] = [
  [
    "How do I test my face symmetry?",
    "Upload a clear photo where you look straight at the camera, then press Test my symmetry. Ollie maps 478 points on your face, mirrors them, and shows how symmetric you are compared with real faces, with your face mirrored left-to-left and right-to-right.",
  ],
  [
    "Is anyone's face perfectly symmetrical?",
    `No. Every face is a little asymmetric. In the ${FACES} reference photos, matching points on the two sides typically miss each other by about ${TYPICAL}% of the distance between the eyes, and even the most symmetric faces are never at zero.`,
  ],
  [
    "What is a good face symmetry score?",
    "Anything from about 40 to 60 is average. Above 80 means your face is more symmetric than four in five faces. A low score usually says more about the photo (a slight head turn, a lopsided smile, wide-angle selfie distortion) than about your face.",
  ],
  [
    "Does face symmetry mean you're attractive?",
    "Only a little. Studies find people rate slightly more symmetric faces as a bit more attractive, but the effect is small next to things like skin, expression and familiarity, and perfectly symmetric composites often look odd. That's why this test measures symmetry and does not rate looks.",
  ],
  [
    "Why does my score change between photos?",
    `The camera matters as much as your face. Head turns of a few degrees, a phone held close to your face, uneven lighting and expressions all shift the points. The test rejects photos turned more than ${MAX_YAW}° to the side. For a fair score, use a straight-on photo at arm's length with a neutral face.`,
  ],
  [
    "Is my photo stored?",
    "No. The whole test runs in your browser and your photo never leaves your device. The share image is drawn on your device too.",
  ],
]

const RELATED: [string, string][] = [
  ["/blog/symmetrical-faces", "Face symmetry and AI recognition: does perfect symmetry matter?"],
  ["/blog/golden-ratio-face", "The golden ratio and facial attractiveness: myth vs evidence"],
  ["/blog/face-attractiveness-research", "What 50 years of attractiveness research tells us"],
  ["/blog/face-shape-guide", "Face shapes explained"],
]

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Ollie Face Symmetry Test",
      url: `${SITE_URL}/face-symmetry-test`,
      description: DESCRIPTION,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Maps 478 face points in the browser",
        `Ranks your symmetry against ${FACES} real faces`,
        "Breakdown for eyes, eyebrows, nose, mouth and jaw",
        "Left-side and right-side mirrored versions of your face",
        "Photo never uploaded",
      ],
      dateModified: SYMMETRY_UPDATED,
      creator: { "@type": "Organization", name: "Ollie" },
      publisher: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Face symmetry test", item: `${SITE_URL}/face-symmetry-test` },
      ],
    },
    { "@type": "FAQPage", mainEntity: QUESTIONS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ],
}

export default function FaceSymmetryPage() {
  return (
    <>
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <SymmetryTest />

        {/* Server-rendered so crawlers, AI answer engines and no-JS visitors can read what the tool does */}
        <section aria-labelledby="how-heading" className="relative mx-auto max-w-3xl px-6 pb-24 pt-8">
          <div data-reveal="1" className={`${card} p-6 md:p-10`}>
            <p className="text-white/70 leading-relaxed text-pretty">
              Ollie&apos;s face symmetry test maps 478 points on your face, mirrors one side onto the other, and measures how far they miss. Your
              result is ranked against {FACES} straight-on photos of real faces, overall and for your eyes, brows, nose, mouth and jaw. It&apos;s
              free, runs in your browser, and your photo is never uploaded.
            </p>

            <h2 id="how-heading" className="mt-12 text-2xl font-black text-white tracking-tight text-balance">How the face symmetry test works</h2>
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

            <h2 className="mt-12 text-2xl font-black text-white tracking-tight text-balance">How to get an accurate result</h2>
            <ul className="mt-6 space-y-3 text-white/70 leading-relaxed list-disc pl-5 marker:text-(--ollie-cyan)">
              <li>Look straight at the camera, with your head level. A turn of a few degrees shows up as asymmetry.</li>
              <li>Hold the phone at arm&apos;s length, or use the rear camera. Close-up selfies stretch the middle of the face.</li>
              <li>Keep a neutral face. Smiles and raised eyebrows are rarely even on both sides.</li>
              <li>Use soft, even light from the front, and pull hair back from your face.</li>
            </ul>

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
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </main>
      <Footer />
      <RevealOnScroll />
    </>
  )
}
