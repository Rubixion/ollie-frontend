import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { OWNER } from "@/lib/facts"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { ContactForm } from "@/components/contact-form"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { card } from "@/lib/surfaces"

export const metadata = {
  title: "Contact",
  description:
    "Message or email the Ollie team about questions, bugs, privacy or data-deletion requests, or removing a photo from the celebrity index.",
  alternates: { canonical: "/contact" },
}

const REASONS = [
  ["Questions and bugs", "Something broke, a result looks wrong, or you want to know how a part of Ollie works."],
  ["Privacy requests", "Ask what data is held about your account, or ask for your account and search records to be deleted."],
  ["Photo removal", "If you appear in the celebrity index, or you took one of the photos, ask for it to be taken down."],
  ["Legal and press", "Legal notices and press enquiries. If emailing, put \"Legal\" or \"Press\" in the subject line."],
]

// Above the fold, so the columns load in on their own (data-reveal only animates what starts off screen)
const loadIn = "animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-backwards motion-reduce:animate-none"

export default function ContactPage() {
  return (
    <>
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-[clamp(5rem,12svh,8rem)]">
          <div className="text-center" data-parallax="near">
            <h1 className="fluid-h1-sm font-black text-white tracking-[-0.015em] leading-[1.05] text-balance">
              Contact the Ollie team
            </h1>
            <p className="mx-auto mt-[clamp(0.5rem,2svh,1rem)] max-w-xl text-base leading-relaxed text-white/70 text-pretty">
              Contact the developers directly regarding issues, bugs, or questions
            </p>
            <p className="mt-2 text-sm text-white/60">
              Prefer email?{" "}
              <a href={`mailto:${OWNER.email}`} className="text-(--ollie-cyan) underline underline-offset-4 hover:text-white">
                {OWNER.email}
              </a>
            </p>
          </div>

          <div className="mt-[clamp(1.25rem,4svh,3rem)] grid gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
            <div className={loadIn}>
              <ContactForm />
            </div>

            <section className={`${loadIn} delay-150`} aria-labelledby="contact-topics">
              <h2 id="contact-topics" className="mb-3 px-1 text-xl font-black tracking-tight text-white">What to get in touch about</h2>
              <dl className="space-y-2.5">
                {REASONS.map(([title, body]) => (
                  <div key={title} className={`${card} p-4`}>
                    <dt className="text-sm font-semibold text-white">{title}</dt>
                    <dd className="mt-1 text-sm leading-snug text-white/65">{body}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <RevealOnScroll />
    </>
  )
}
