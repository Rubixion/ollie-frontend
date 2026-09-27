import type { Metadata } from "next"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { InfoTabs, type InfoTab } from "@/components/info-tabs"
import { TextEffect } from "@/components/ui/text-effect"
import { card } from "@/lib/surfaces"
import { MODEL, OWNER, SEARCH_LOG_DAYS } from "@/lib/facts"
import { FAQ, STEPS } from "@/lib/faq"

const DESCRIPTION = "How Ollie matches your face, how to get a better match, what it gets wrong, what happens to your photo, and answers to common questions."

export const metadata: Metadata = {
  title: "FAQ: How Ollie Works",
  description: DESCRIPTION,
  alternates: { canonical: "/faq" },
  openGraph: { type: "website", url: "/faq", title: "Ollie FAQ", description: DESCRIPTION },
}

const TIPS: { tip: string; href?: string; link?: string }[] = [
  { tip: "Face the camera straight on. A turned head hides half of your face from the model.", href: "/blog/best-photo-celebrity-match", link: "What makes a good photo" },
  { tip: "Use soft, even light, like a window in daytime. Poor lighting hides the structure of your face and shifts its skin tone, and both lower match quality.", href: "/blog/best-lighting-for-match", link: "Lighting guide" },
  { tip: "Take off sunglasses and hats, and keep hair off your face.", href: "/blog/improving-ollie-results", link: "How to improve your results" },
  { tip: "Be the only face in the photo, or the biggest one. Ollie matches the largest face it finds." },
  { tip: "Use a sharp, recent photo without beauty filters. Filters smooth away the details the model measures." },
]

const LIMITS = [
  [
    "The celebrity list follows Wikipedia.",
    "Most people were picked by how much their English Wikipedia page is read and how many languages cover them, so the list leans toward people famous in English-speaking countries. A second list, ranked by each region's own-language Wikipedias, adds stars from East and South Asia, Southeast Asia, Latin America, Africa and the Middle East, but coverage is still uneven, and about three in five of the people on it are men. Someone who is a household name in one country may be missing.",
  ],
  [
    "The model learned from an uneven set of faces.",
    "Its training photos (MS1MV2) are mostly of lighter-skinned people, so the model is likely less precise for darker skin tones. It hasn't been measured separately for each group yet.",
  ],
  [
    "The percentage is for comparing, not a verdict.",
    "It comes from the distance between your face's numbers and a celebrity's, stretched onto a 0 to 100 scale so the gaps are easier to read. Compare your five matches with each other. Don't compare scores across different photos, and don't treat them as a probability.",
  ],
  [
    "It's for fun, and for adults.",
    "Everyone in the index is an adult, and Ollie is for people aged 18 and over. It can't tell who someone is, and it shouldn't be used to try.",
  ],
]

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
}

const h2 = "text-2xl font-black text-white tracking-tight text-balance"
const body = "text-white/70 leading-relaxed text-pretty"
const link = "text-(--ollie-cyan) underline underline-offset-4 hover:text-white"

const TABS: InfoTab[] = [
  {
    id: "how",
    label: "How it works",
    content: (
      <>
        <h2 id="how" className={`${h2} scroll-mt-24`}>How Ollie matches your face</h2>
        <ol className="mt-6 space-y-5">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="flex gap-4">
              <span className="text-(--ollie-cyan) font-black tabular-nums leading-relaxed">{i + 1}</span>
              <p className={body}>
                <strong className="text-white font-semibold">{title}</strong> {text}
              </p>
            </li>
          ))}
        </ol>
      </>
    ),
  },
  {
    id: "tips",
    label: "Better photos",
    content: (
      <>
        <h2 id="tips" className={h2}>Getting a better match</h2>
        <ul className="mt-6 space-y-4 list-disc pl-5 marker:text-(--ollie-cyan)">
          {TIPS.map(({ tip, href, link: label }) => (
            <li key={tip} className={body}>
              {tip}
              {href && (
                <>
                  {" "}
                  <Link href={href} className={link}>{label}</Link>
                </>
              )}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "limits",
    label: "Limitations",
    content: (
      <>
        <h2 id="limits" className={h2}>What Ollie gets wrong</h2>
        <div className="mt-6 space-y-5">
          {LIMITS.map(([title, text]) => (
            <p key={title} className={body}>
              <strong className="text-white font-semibold">{title}</strong> {text}
            </p>
          ))}
          <p className={body}>
            More on reading the percentage: <Link href="/blog/understanding-your-results" className={link}>understanding your results</Link>.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "privacy",
    label: "Privacy",
    content: (
      <>
        <h2 id="privacy" className={h2}>What happens to your photo</h2>
        <div className="mt-6 space-y-4">
          <p className={body}>
            Your photo is shrunk in your browser, sent over an encrypted connection to Ollie&apos;s matching server,
            and held in memory for the few seconds the search takes. Then it&apos;s gone. It is never saved, logged,
            or used to train the model, and nobody looks at it.
          </p>
          <p className={body}>
            For each search Ollie records the time, your account (or an ID made from your IP address if you
            aren&apos;t signed in) and your IP address, so the free-search limit works. Those records are deleted
            after {SEARCH_LOG_DAYS}{" "}days. The share image is made on your device and shows your photo next to your
            match; untick &ldquo;Include my photo&rdquo; to leave it off.
          </p>
          <p className={body}>
            The details, including the companies that run the servers, are in the{" "}
            <Link href="/privacy" className={link}>privacy policy</Link>.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "faq",
    label: "Questions",
    content: (
      <>
        <h2 id="faq" className={h2}>Questions</h2>
        <div className="mt-6 space-y-8">
          {FAQ.map(([q, a]) => (
            <div key={q}>
              <h3 className="text-lg font-bold text-white text-balance">{q}</h3>
              <p className={`mt-2 ${body}`}>{a}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "model",
    label: "The model",
    content: (
      <>
        <h2 id="model" className={h2}>About the model</h2>
        <p className={`mt-6 ${body}`}>
          The Ollie team wrote and trained Ollie&apos;s face-recognition model from scratch in PyTorch: {MODEL.summary}, on{" "}
          {MODEL.trainingSet}. Training took {MODEL.trainingTime}. It scores {MODEL.lfw}{" "}on the LFW benchmark, with
          every LFW identity removed from the training data first so the test is fair. InsightFace handles finding
          and aligning the face; everything after that is Ollie&apos;s own model.
        </p>
        <p className="mt-6 text-sm text-white/60">
          {OWNER.name}, <Link href="/contact" className={link}>contact</Link>.
        </p>
      </>
    ),
  },
]

export default function GoodToKnowPage() {
  return (
    <>
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      {/* Server-rendered (inside the tabs) so crawlers, AI answer engines and no-JS visitors get the full explanation */}
      <main id="main" className="relative min-h-screen bg-transparent">
        <section id="info" aria-labelledby="info-heading" className="relative mx-auto max-w-3xl scroll-mt-20 px-6 pb-24 pt-[clamp(5rem,11svh,7rem)]">
          <div className="mb-8 text-center">
            <h1 id="info-heading" className="fluid-h1-sm font-black text-white tracking-[-0.015em] leading-[1.05] text-balance">
              <TextEffect as="span" per="word" preset="blur">FAQ</TextEffect>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/70 text-pretty animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-backwards motion-reduce:animate-none">
              How Ollie works, what it gets wrong and what happens to your photo.
            </p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-backwards motion-reduce:animate-none">
            <InfoTabs tabs={TABS} panelClassName={`${card} p-6 md:p-10`} />
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </main>
      <Footer />
    </>
  )
}
