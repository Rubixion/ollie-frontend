import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { StepIcon } from "@/components/step-icon"
import { ModelSection, card } from "@/components/model-section"
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader"
import { ScrollButton } from "@/components/scroll-button"
import { Button, buttonVariants } from "@/components/ui/button"
import { TextEffect } from "@/components/ui/text-effect"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { INDEX } from "@/lib/facts"
import { GUEST_LIMIT } from "@/lib/search-quota"

// Distinct from /celebrity-lookalike's title so the two pages don't compete for the same search.
// Under ~155 characters so Google shows all of it
const DESCRIPTION = `Which celebrity do you look like? Ollie's celebrity lookalike AI finds your top 5 matches from ${INDEX.celebrities} stars in seconds. Free, photo never stored.`
const TITLE = "Ollie: Free Celebrity Lookalike AI"

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/", types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "The Ollie Blog" }] } },
  // siteName repeated: a page's openGraph replaces the layout's instead of merging, and Google reads og:site_name for the site name
  openGraph: { type: "website", url: "/", siteName: "Ollie", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

// Decorative: the look of 512 numbers, not real output
const SAMPLE_NUMBERS = ["0.041", "-0.127", "0.338", "-0.062", "0.215", "0.009"]

// Recessed well inside a step card
const well = "h-28 flex flex-col justify-center rounded-2xl bg-black/35 shadow-[inset_0_1px_3px_rgb(0_0_0/0.5)]"

const STEPS = [
  {
    step: "01",
    title: "Upload your photo",
    desc: "One clear, front-facing face works best. Your photo is only used for the search, then discarded.",
    visual: (
      <div className={`${well} px-4 items-center text-center gap-2`}>
        <span className="text-white/40 text-xs">Drag and drop or click to browse</span>
        <span className="text-white/25 text-[10px]">JPG · PNG · WEBP</span>
      </div>
    ),
  },
  {
    step: "02",
    title: "Ollie reads your face",
    desc: "A detector finds and lines up your face. Then Ollie's neural network turns it into 512 numbers that describe its structure.",
    visual: (
      <div className={`${well} px-4 text-[11px] text-white/40 leading-loose tabular-nums`}>
        <div>
          {SAMPLE_NUMBERS.map((n) => (
            <span key={n} className="mr-2.5 inline-block">{n}</span>
          ))}
        </div>
        <span className="block text-(--ollie-cyan)/70">… 506 more</span>
      </div>
    ),
  },
  {
    step: "03",
    title: "See your top five",
    desc: `Those numbers are compared with every photo of ${INDEX.celebrities} celebrities, and the five closest faces are ranked by similarity.`,
    visual: (
      <div className={`${well} px-4 gap-2.5`}>
        {[["1", "88%"], ["2", "76%"], ["3", "61%"]].map(([rank, pct]) => (
          <div key={rank} className="flex items-center gap-3">
            <span className="text-white/40 text-[10px] w-3 shrink-0 tabular-nums">{rank}</span>
            <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-(--ollie-cyan)/60" style={{ width: pct }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
]

// The loop the hero's mock window plays: the same steps a real search goes through
const HERO_PHASES = [
  { at: 0, label: "Uploading your photo…" },
  { at: 25, label: "Finding your face…" },
  { at: 50, label: `Comparing ${INDEX.celebrities} celebrities…` },
  { at: 90, label: "Your top five are ready" },
]


export default function Page() {
  return (
    <>
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      <main id="main" className="relative bg-transparent overflow-hidden">
        {/* ── HERO: text is server-rendered at full opacity (LCP); only the loader in the mock window is client-side ── */}
        {/* One screen tall: spacing and type follow the viewport height, and the mock window takes whatever height is
            left, so the whole hero shows on a 720px laptop and on a 1440p monitor alike. */}
        <section className="relative flex min-h-svh flex-col items-center px-6 pt-[clamp(5rem,13svh,9rem)] pb-[clamp(1rem,4svh,2.5rem)]">
          <div className="w-full max-w-4xl mx-auto text-center" data-parallax="near">
            <h1 className="fluid-h1 font-black text-white tracking-[-0.015em] leading-[1.05] text-balance">
              Find your celebrity lookalike with AI.{" "}
              <TextEffect as="span" per="word" preset="blur" delay={0.3} className="text-white/50">In seconds.</TextEffect>
            </h1>
            <p className="mt-[clamp(0.75rem,2.5svh,1.5rem)] text-white/70 text-base sm:text-lg leading-relaxed max-w-xl mx-auto text-pretty">
              Upload a photo and Ollie&apos;s machine learning model finds the five celebrities whose faces are closest
              to yours. Free, and your photo is never stored.
            </p>

            <div className="mt-[clamp(1rem,4svh,2.5rem)] flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild variant="brand" size="cta" className="group w-full sm:w-auto">
                <Link href="/celebrity-lookalike">
                  Find my match
                  <ArrowRight className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" size={16} strokeWidth={2} aria-hidden="true" />
                </Link>
              </Button>
              <ScrollButton to="how" className={buttonVariants({ variant: "brandOutline", size: "cta", className: "w-full sm:w-auto" })}>
                How it works
              </ScrollButton>
            </div>
          </div>

          {/* Mock /celebrity-lookalike window: the search loader plays on a loop in place of a screenshot */}
          <div className="mt-[clamp(1.25rem,5svh,4rem)] flex min-h-48 w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#050505] max-h-[clamp(16rem,42svh,30rem)]" data-parallax="rise" aria-hidden="true">
            <div className="relative flex items-center justify-center border-b border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="absolute left-4 flex gap-1.5">
                {[0, 1, 2].map((i) => <div key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />)}
              </div>
              <div className="mx-auto flex h-7 w-full max-w-md items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white/50">
                <Search size={14} />
                <span className="truncate">Search {INDEX.celebrities} celebrities</span>
              </div>
            </div>
            <div className="flex flex-1 items-center px-6">
              <ProgressiveFluxLoader
                duration={8}
                phases={HERO_PHASES}
                className="gap-6 [--flux-from:var(--ollie-purple)] [--flux-to:var(--ollie-cyan)]"
                barClassName="h-2.5 bg-white/10 shadow-none"
                textClassName="text-lg sm:text-2xl md:text-3xl font-bold text-white/70"
              />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS: no dividers; sections share the hero's centred axis so the page reads as one column ── */}
        {/* From md up it fills the screen under the 4rem nav, so after "How it works" scrolls here the next heading
            isn't peeking in at the bottom. On phones the stacked cards are taller than the screen anyway. */}
        <section id="how" className="px-6 py-[clamp(2.5rem,7svh,5rem)] max-w-6xl mx-auto scroll-mt-16 md:min-h-[calc(100svh-4rem)] md:flex md:flex-col md:justify-center" aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-center text-3xl md:text-4xl font-black text-white tracking-tight text-balance">
            From photo to lookalike
          </h2>
          <p className="mt-3 mb-[clamp(1.5rem,5svh,3rem)] mx-auto text-center text-white/60 text-base max-w-lg text-pretty">
            Three steps, a few seconds. No account needed for {GUEST_LIMIT} searches a day.
          </p>

          <ol className="grid md:grid-cols-3 gap-3">
            {STEPS.map(({ step, title, desc, visual }, i) => (
              <li key={step} data-reveal={i + 1} className={`${card} flex flex-col p-6`}>
                <div className="flex items-center justify-between">
                  <StepIcon index={i} />
                  <span className="text-white/30 text-sm font-semibold tabular-nums">{step}</span>
                </div>
                <div className="mt-6" aria-hidden="true">{visual}</div>
                <h3 className="mt-6 text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed text-pretty">{desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex justify-center">
            <Button asChild variant="brand" size="cta" className="group">
              <Link href="/celebrity-lookalike">
                Find your celebrity look alike
                <ArrowRight className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" size={16} strokeWidth={2} aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── THE MODEL ── */}
        <ModelSection />
      </main>
      <Footer />
      <RevealOnScroll />
    </>
  )
}
