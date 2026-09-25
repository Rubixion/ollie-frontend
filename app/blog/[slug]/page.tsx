import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { allPosts, getPost, type BlogPost } from "@/lib/blog-posts"
import { SITE_URL } from "@/lib/site-config"
import { ArrowLeft, ArrowRight, Clock, User, Calendar, ChevronRight } from "lucide-react"
import { BGPattern } from "@/components/bg-pattern"

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false // only the posts in lib/blog-posts*.ts; anything else is a real 404

export async function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

// Cut at a word boundary so snippets never end mid-word
function clip(text: string, max: number) {
  if (text.length <= max) return text
  return text.slice(0, text.lastIndexOf(" ", max - 1)).replace(/[,;:]$/, "") + "…"
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}

  const description = clip(post.excerpt, 160)
  return {
    // long titles skip the " | Ollie" suffix instead of being cut off
    title: post.title.length > 52 ? { absolute: post.title } : post.title,
    description,
    authors: [{ name: post.author }],
    alternates: {
      canonical: `/blog/${post.slug}`,
      types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "The Ollie Blog" }] },
    },
    openGraph: {
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      siteName: "Ollie",
      type: "article",
      publishedTime: post.isoDate,
      modifiedTime: post.updatedIsoDate ?? post.isoDate,
      section: post.category,
      tags: post.keywords,
    },
    twitter: { card: "summary_large_image", title: post.title, description },
  }
}

// Readable, shareable section anchors (#best-lighting, not #h-3). A repeated heading gets -2, -3...
function headingIds(headings: string[]) {
  const seen = new Map<string, number>()
  return headings.map((h) => {
    const base = h.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section"
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base}-${n}`
  })
}

// The first mention of the site's main keyword in a post's body links to /match, so every article passes
// its topical relevance to the page that should rank. One link per post, and only where the phrase is already used.
const MATCH_PHRASE = /celebrit(?:y|ies) (?:you )?look[- ]?alikes?|celebrity match(?:es)?|which celebrit(?:y|ies) you look like|celebrity doppelg[aä]ngers?/i
const bodyLink = "text-(--ollie-cyan) underline underline-offset-4 hover:text-white"

function linkFirstMention(sections: BlogPost["sections"]) {
  let done = false
  return sections.map((s) => ({
    ...s,
    paragraphs: s.paragraphs.map((p) => {
      if (done || !MATCH_PHRASE.test(p)) return p
      done = true
      return p.replace(MATCH_PHRASE, (m) => `<a href="/match" class="${bodyLink}">${m}</a>`)
    }),
  }))
}

function TableOfContents({ headings, ids }: { headings: string[]; ids: string[] }) {
  if (headings.length < 2) return null
  return (
    <nav aria-label="In this article" className="mb-10 p-5 rounded-xl bg-white/[0.03] border border-white/8">
      <p className="text-[10px] font-bold tracking-widest uppercase text-white/60 mb-3">In this article</p>
      <ol className="space-y-1.5">
        {headings.map((h, i) => (
          <li key={i}>
            <a
              href={`#${ids[i]}`}
              className="text-sm text-white/50 hover:text-(--ollie-cyan) transition-colors leading-snug block"
            >
              {h}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const url = `${SITE_URL}/blog/${post.slug}`
  const modified = post.updatedIsoDate ?? post.isoDate
  const h2s = post.sections.filter((s) => s.h2).map((s) => s.h2!)
  const ids = headingIds(h2s)
  let h2Index = 0
  const sections = linkFirstMention(post.sections).map((s) => ({ ...s, id: s.h2 ? ids[h2Index++] : undefined }))
  const relatedPosts = post.relatedSlugs.map((s) => getPost(s)).filter((p) => p !== undefined)
  const words = post.sections
    .flatMap((s) => [s.h2 ?? "", ...s.paragraphs])
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.excerpt,
        abstract: post.summary,
        image: `${url}/opengraph-image`,
        datePublished: post.isoDate,
        dateModified: modified,
        author: { "@type": "Organization", name: post.author, url: SITE_URL },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: url,
        isPartOf: { "@id": `${SITE_URL}/blog#blog` },
        articleSection: post.category,
        keywords: post.keywords.join(", "),
        wordCount: words,
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
      ...(post.faqs.length > 0
        ? [{
            "@type": "FAQPage",
            mainEntity: post.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }]
        : []),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <BGPattern variant="grid" mask="fade-edges" fill="rgba(255,255,255,0.04)" size={32} className="fixed" />

        <div className="max-w-3xl mx-auto px-6 pt-28 pb-24">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/60 mb-10">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link href="/blog" className="hover:text-white/70 transition-colors">Blog</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-white/50 truncate max-w-[240px]" aria-current="page">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-[10px] font-bold tracking-widest uppercase text-(--ollie-cyan) bg-(--ollie-cyan)/10 px-2.5 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5 tracking-tight">
              {post.title}
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-6 border-l-2 border-(--ollie-cyan) pl-4">{post.summary}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 pt-5">
              <span className="flex items-center gap-1.5">
                <User size={12} aria-hidden="true" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={12} aria-hidden="true" />
                <time dateTime={post.isoDate}>{post.date}</time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} aria-hidden="true" />
                {post.readTime}
              </span>
            </div>
          </header>

          <TableOfContents headings={h2s} ids={ids} />

          {/* Article body */}
          <article>
            {sections.map((section, i) => (
              <section key={i}>
                {section.h2 && (
                  <h2
                    id={section.id}
                    className="text-xl font-bold text-white mt-10 mb-4 scroll-mt-24"
                  >
                    {section.h2}
                  </h2>
                )}
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className="text-white/65 leading-relaxed mb-4 [&_strong]:text-white/85"
                    dangerouslySetInnerHTML={{ __html: p }}
                  />
                ))}
              </section>
            ))}
          </article>

          {/* FAQ */}
          {post.faqs.length > 0 && (
            <section className="mt-14">
              <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {post.faqs.map((faq, i) => (
                  <div key={i} className="p-5 rounded-xl bg-white/[0.03] border border-white/8">
                    <h3 className="text-sm font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mt-14 p-7 rounded-2xl bg-(--ollie-cyan)/5 border border-(--ollie-cyan)/20">
            <p className="text-[10px] font-bold tracking-widest uppercase text-(--ollie-cyan) mb-2">Try it yourself</p>
            <h2 className="text-xl font-bold text-white mb-2">Find your celebrity lookalike</h2>
            <p className="text-white/55 text-sm mb-5">
              Upload a photo and see which celebrities you look most like. Free to try, and your photo is never stored.
            </p>
            <Link
              href="/match"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-(--ollie-cyan) text-black text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Find my match <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </section>


          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-14">
              <h2 className="text-xl font-bold text-white mb-6">Related Articles</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="block p-5 rounded-xl bg-white/[0.02] border border-white/8 hover:border-white/20 hover:bg-white/[0.04] transition-all group"
                  >
                    <span className="text-[9px] font-bold tracking-widest uppercase text-(--ollie-cyan) block mb-2">
                      {related.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors leading-snug mb-1">
                      {related.title}
                    </h3>
                    <span className="text-xs text-white/60">{related.readTime}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back link */}
          <div className="mt-14 pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/75 transition-colors"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              All articles
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
