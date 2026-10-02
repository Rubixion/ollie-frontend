import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { TrackedLink } from "@/components/tracked-link"
import { card } from "@/lib/surfaces"
import { INDEX, MODEL } from "@/lib/facts"
import { LOOK_ALIKE_LIVE, LOOK_ALIKE_UPDATED, SITE_URL } from "@/lib/site-config"
import { getLookAlike, imgSrc, lookAlikePages, role, shown, type Credit, type LookAlikePage } from "@/lib/look-alike"

// Hidden until LOOK_ALIKE_LIVE (noindex, not in the sitemap, linked from nowhere). One page per celebrity with
// real "<name> look alike" search volume; data from lib/look-alike-data.json. Main keyword: "<name> look alike".

interface Props {
  params: Promise<{ slug: string }>
}

// No `dynamicParams = false`: on Cloudflare (OpenNext, no incremental cache) it 404s every page. Unknown slugs 404 below.
export async function generateStaticParams() {
  return lookAlikePages.map((p) => ({ slug: p.slug }))
}

function clip(text: string, max: number) {
  return text.length <= max ? text : text.slice(0, text.lastIndexOf(" ", max - 1)).replace(/[,;:]$/, "") + "…"
}

const list = (names: string[]) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`)

function copy(p: LookAlikePage) {
  const [a, b, c] = p.matches
  const long = `${p.name} Look Alike: Who Looks Like ${p.name}?`
  return {
    title: long.length <= 60 ? long : `${p.name} Look Alike: Top Matches by AI`,
    description: clip(`The celebrities who look most like ${p.name}, ranked by Ollie's face-recognition AI: ${list([a, b, c].map((m) => m.name))}. See the scores, then test your own face.`, 155),
    answer: `According to Ollie's face-recognition model, the celebrity who looks most like ${p.name} is ${a.name} (${shown(a.score)}% on Ollie's scale), followed by ${b.name} (${shown(b.score)}%) and ${c.name} (${shown(c.score)}%). The model compared ${p.photos} photos of ${p.name} with ${INDEX.photos} photos of ${INDEX.celebrities} celebrities and ranked everyone by how close their faces are.`,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getLookAlike((await params).slug)
  if (!p) return {}
  const { title, description } = copy(p)
  const url = `/look-alike/${p.slug}`
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: LOOK_ALIKE_LIVE ? undefined : { index: false, follow: false },
    openGraph: { type: "article", siteName: "Ollie", url, title, description },
    twitter: { card: "summary_large_image", title, description },
  }
}

function CreditLine({ name, credit }: { name: string; credit: Credit }) {
  const link = "underline decoration-white/20 underline-offset-2 hover:text-white/70"
  return (
    <li>
      {name}:{" "}
      {credit.page ? <a href={credit.page} target="_blank" rel="noopener noreferrer" className={link}>{credit.author}</a> : credit.author},{" "}
      {credit.license_url ? <a href={credit.license_url} target="_blank" rel="noopener noreferrer license" className={link}>{credit.license}</a> : credit.license}{" "}
      (cropped), via Wikimedia Commons
    </li>
  )
}

function Face({ src, alt, size }: { src: string; alt: string; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized 128px WebP in public/, no optimisation needed
    <img src={src} alt={alt} width={size} height={size} loading="lazy" decoding="async" className="shrink-0 rounded-2xl object-cover border border-white/10" style={{ width: size, height: size }} />
  )
}

export default async function LookAlikePageView({ params }: Props) {
  const p = getLookAlike((await params).slug)
  if (!p) notFound()

  const url = `${SITE_URL}/look-alike/${p.slug}`
  const { title, answer } = copy(p)
  const [top] = p.matches
  const alsoIn = p.alsoIn.map((s) => getLookAlike(s)!).filter(Boolean)
  // Links between pages: their matches that have a page, pages that list them, then the next pages by search volume
  const at = lookAlikePages.indexOf(p)
  const related = [...new Set([...p.matches.filter((m) => m.hasPage).map((m) => m.slug), ...p.alsoIn, ...lookAlikePages.slice(at + 1, at + 7).map((q) => q.slug)])]
    .filter((s) => s !== p.slug)
    .slice(0, 6)
    .map((s) => getLookAlike(s)!)

  const faqs: [string, string][] = [
    [`Who looks like ${p.name}?`, `Ollie's face-recognition model ranks ${list(p.matches.slice(0, 5).map((m) => m.name))} as the celebrities who look most like ${p.name}. ${top.name} is the closest, at ${shown(top.score)}% on Ollie's scale.`],
    [`How similar is ${top.name} to ${p.name}?`, `${top.name} scores ${shown(top.score)}% against ${p.name} on Ollie's scale. For comparison, two celebrities picked at random score about 33%, and only 1 pair in 100 reaches 58%, so every match on this page is unusually close.`],
    [`How does Ollie decide who looks like ${p.name}?`, `Ollie's own face-recognition model turns every photo into 512 numbers that describe the face's structure. It compares each of ${p.name}'s ${p.photos} photos with every photo of each other celebrity, averages the two closest photo pairs, and ranks celebrities by that score. Hair, makeup and background don't count.`],
    [`Do I look like ${p.name}?`, `Upload a photo to Ollie's free celebrity lookalike finder and it ranks ${INDEX.celebrities} celebrities, ${p.name} included, by how close they are to your face. Your photo is never stored.`],
  ]

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: title,
        description: answer,
        image: { "@type": "ImageObject", contentUrl: `${SITE_URL}${imgSrc(p.img)}`, creditText: p.credit.author, license: p.credit.license_url || undefined, acquireLicensePage: p.credit.page },
        about: { "@type": "Person", name: p.name, description: p.knownFor },
        dateModified: LOOK_ALIKE_UPDATED,
        author: { "@type": "Organization", name: "Ollie" },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: url,
        inLanguage: "en",
      },
      {
        "@type": "ItemList",
        name: `Celebrities who look like ${p.name}`,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: p.matches.map((m, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Person", name: m.name, description: m.knownFor } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Famous look alikes", item: `${SITE_URL}/look-alike` },
          { "@type": "ListItem", position: 3, name: `${p.name} look alike`, item: url },
        ],
      },
      { "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <div className="max-w-3xl mx-auto px-6 pt-28 pb-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/60 mb-10">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link href="/look-alike" className="hover:text-white/70 transition-colors">Famous look alikes</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-white/50 truncate max-w-[240px]" aria-current="page">{p.name}</span>
          </nav>

          <header className="mb-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-(--ollie-cyan) bg-(--ollie-cyan)/10 px-2.5 py-1 rounded-full">
              Look alikes
            </span>
            <h1 className="mt-5 text-3xl md:text-4xl font-black text-white leading-tight tracking-tight text-balance">
              {p.name} look alike: the celebrities who look most like {p.name}
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed text-pretty">{answer}</p>
          </header>

          {/* The headline pair */}
          <figure className={`${card} p-6 md:p-8 mb-10`}>
            <div className="flex items-center justify-center gap-4 md:gap-8">
              <div className="text-center">
                <Face src={imgSrc(p.img)} alt={`Photo of ${p.name}`} size={128} />
                <p className="mt-2 text-sm font-semibold text-white">{p.name}</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black text-(--ollie-cyan) tabular-nums tracking-tight">{shown(top.score)}%</p>
                <p className="text-xs text-white/60 mt-1">lookalike</p>
              </div>
              <div className="text-center">
                <Face src={imgSrc(top.img)} alt={`Photo of ${top.name}`} size={128} />
                <p className="mt-2 text-sm font-semibold text-white">{top.name}</p>
              </div>
            </div>
            <figcaption className="mt-5 text-center text-xs text-white/60">
              {p.name}&apos;s closest celebrity match, scored by Ollie&apos;s face-recognition model
            </figcaption>
          </figure>

          <section aria-labelledby="ranking" className="mb-12">
            <h2 id="ranking" className="text-2xl font-black text-white tracking-tight text-balance">
              Who looks like {p.name}? The top {p.matches.length}
            </h2>
            <ol className="mt-6 space-y-3">
              {p.matches.map((m, i) => (
                <li key={m.slug} className={`${card} flex items-center gap-4 p-4`}>
                  <span className="w-5 text-(--ollie-cyan) font-black tabular-nums">{i + 1}</span>
                  <Face src={imgSrc(m.img)} alt={`Photo of ${m.name}`} size={64} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate">
                      {m.hasPage ? (
                        <Link href={`/look-alike/${m.slug}`} className="hover:text-(--ollie-cyan) transition-colors">{m.name}</Link>
                      ) : m.name}
                    </p>
                    <p className="text-xs text-white/60 truncate">{role(m.knownFor)}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
                      <div className="h-full rounded-full bg-(--ollie-cyan)" style={{ width: `${shown(m.score)}%` }} />
                    </div>
                  </div>
                  <span className="text-lg font-black text-white tabular-nums">{shown(m.score)}%</span>
                </li>
              ))}
            </ol>
            {alsoIn.length > 0 && (
              <p className="mt-6 text-white/70 leading-relaxed text-pretty">
                It works both ways: {p.name} also appears among the closest look alikes of{" "}
                {alsoIn.map((q, i) => (
                  <span key={q.slug}>
                    {i > 0 && (i === alsoIn.length - 1 ? " and " : ", ")}
                    <Link href={`/look-alike/${q.slug}`} className="text-(--ollie-cyan) underline underline-offset-4 decoration-(--ollie-cyan)/30 hover:decoration-(--ollie-cyan)">{q.name}</Link>
                  </span>
                ))}
                .
              </p>
            )}
          </section>

          <section className={`${card} p-6 md:p-10 mb-12 text-center`}>
            <h2 className="text-2xl font-black text-white tracking-tight text-balance">Do you look like {p.name}?</h2>
            <p className="mt-3 text-white/70 leading-relaxed text-pretty">
              Upload a selfie and Ollie ranks {INDEX.celebrities} celebrities by how close they are to your face. Free, and your photo is never stored.
            </p>
            <Button asChild variant="brand" size="cta" className="mt-6">
              <TrackedLink href="/celebrity-lookalike" event="lookalike_page_cta" params={{ celebrity: p.slug }}>
                Find your celebrity look alike <ArrowRight size={16} aria-hidden="true" />
              </TrackedLink>
            </Button>
          </section>

          <section aria-labelledby="method" className="mb-12">
            <h2 id="method" className="text-2xl font-black text-white tracking-tight text-balance">How Ollie measured this</h2>
            <div className="mt-4 space-y-4 text-white/70 leading-relaxed text-pretty">
              <p>
                Ollie&apos;s face-recognition model is {MODEL.summary}. It scores {MODEL.lfw} on Labeled Faces in the Wild, the standard test of
                whether two photos show the same person. It reads face structure, so hair colour, makeup and the background don&apos;t move the score.
              </p>
              <p>
                For each celebrity, every photo of {p.name} was compared with every photo of them, and the two closest photo pairs were averaged.
                That way one lucky photo can&apos;t put someone at the top. Only celebrities of the same gender are ranked, as in the lookalike finder.
              </p>
              <p>
                The percentage is a similarity score, not a probability. Two celebrities picked at random score about 33%, and only 1 pair in 100
                reaches 58%. The full study of {INDEX.celebrities} celebrities is in{" "}
                <Link href="/blog/celebrities-who-look-alike" className="text-(--ollie-cyan) underline underline-offset-4 decoration-(--ollie-cyan)/30 hover:decoration-(--ollie-cyan)">
                  which celebrities look alike, according to an AI
                </Link>
                .
              </p>
            </div>
          </section>

          <section aria-labelledby="faq" className="mb-12">
            <h2 id="faq" className="text-2xl font-black text-white tracking-tight text-balance">Common questions</h2>
            <div className="mt-6 space-y-8">
              {faqs.map(([q, a]) => (
                <div key={q}>
                  <h3 className="text-lg font-bold text-white text-balance">{q}</h3>
                  <p className="mt-2 text-white/70 leading-relaxed text-pretty">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {related.length > 0 && (
            <nav aria-labelledby="more" className="mb-12">
              <h2 id="more" className="text-2xl font-black text-white tracking-tight text-balance">More famous look alikes</h2>
              <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {related.map((q) => (
                  <li key={q.slug}>
                    <Link href={`/look-alike/${q.slug}`} className={`${card} flex items-center gap-3 p-3 hover:bg-white/[0.04] transition-colors`}>
                      <Face src={imgSrc(q.img)} alt="" size={40} />
                      <span className="text-sm font-semibold text-white leading-snug">{q.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <footer className="border-t border-white/10 pt-6">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/60 mb-2">Photo credits</p>
            <ul className="space-y-1 text-[11px] leading-snug text-white/60">
              <CreditLine name={p.name} credit={p.credit} />
              {p.matches.map((m) => <CreditLine key={m.slug} name={m.name} credit={m.credit} />)}
            </ul>
          </footer>
        </div>
      </main>
      <Footer />
    </>
  )
}
