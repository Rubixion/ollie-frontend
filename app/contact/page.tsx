import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { OWNER } from "@/lib/facts"
import { BGPattern } from "@/components/bg-pattern"

export const metadata = {
  title: "Contact",
  description:
    "Email the Ollie team about questions, bugs, privacy or data-deletion requests, or removing a photo from the celebrity index.",
  alternates: { canonical: "/contact" },
}

const REASONS = [
  ["Questions and bugs", "Something broke, a result looks wrong, or you want to know how a part of Ollie works."],
  ["Privacy requests", "Ask what data is held about your account, or ask for your account and search records to be deleted."],
  ["Photo removal", "If you appear in the celebrity index, or you took one of the photos, ask for it to be taken down."],
  ["Legal and press", "Put \"Legal\" or \"Press\" in the subject line."],
]

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <BGPattern variant="grid" mask="fade-edges" fill="rgba(255,255,255,0.04)" size={32} className="fixed" />
        <div className="max-w-xl mx-auto px-6 pt-32 pb-20">
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Contact</h1>
          <p className="text-white/70 text-base leading-relaxed text-pretty">
            Ollie is built and run by a small team. Email goes straight to the people who build it.
          </p>

          <a
            href={`mailto:${OWNER.email}`}
            className="mt-10 block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-(--ollie-cyan)/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"
          >
            <span className="block text-white/60 text-sm">Email</span>
            <span className="mt-1 block text-lg font-semibold text-white break-all">{OWNER.email}</span>
          </a>

          <h2 className="mt-14 mb-5 text-lg font-bold text-white">What to email about</h2>
          <dl className="space-y-5">
            {REASONS.map(([title, body]) => (
              <div key={title}>
                <dt className="text-white text-sm font-semibold">{title}</dt>
                <dd className="mt-1 text-white/65 text-sm leading-relaxed">{body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </main>
      <Footer />
    </>
  )
}
