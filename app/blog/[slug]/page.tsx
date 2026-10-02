import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { allPosts, getPost, type BlogPost } from "@/lib/blog-posts"
import { SITE_URL } from "@/lib/site-config"
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react"
import { AuthorBadge } from "@/components/author-badge"
import { card } from "@/lib/surfaces"
import Image from "next/image"
import { blogImages } from "@/lib/blog-images"
import SocialButton from "@/components/ui/social-button"
import PostPagination from "@/components/ui/post-pagination"
import NewsletterForm from "@/components/ui/newsletter-form"

interface Props {
  params: Promise<{ slug: string }>
}

// No `dynamicParams = false`: on Cloudflare (OpenNext, no incremental cache) it 404s every post.
// Unknown slugs still 404 through notFound() below.

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

// The first mention of the site's main keyword in a post's body links to /celebrity-lookalike, so every article passes
// its topical relevance to the page that should rank. One link per post, and only where the phrase is already used.
const MATCH_PHRASE = /celebrit(?:y|ies) (?:you )?look[- ]?alikes?|celebrity match(?:es)?|which celebrit(?:y|ies) you look like|celebrity doppelg[aä]ngers?|what celebrity (?:do )?i look like/i
const bodyLink = "text-(--ollie-cyan) underline underline-offset-4 hover:text-white"

// Same idea for /compare-faces and the key guides: each target gets one link, at its first mention, in order of priority
const LINK_RULES: [href: string, phrase: RegExp][] = [
  ["/celebrity-lookalike", MATCH_PHRASE],
  ["/compare-faces", /compar(?:e|ing) (?:two |2 )?faces|face comparison/i],
  ["/ai-stylist", /haircuts?|hairstyles?|face shapes?/i],
  ["/blog/why-everyone-has-doppelganger", /doppelg[aä]ngers?|resemblances?/i],
  ["/blog/what-is-similarity-score", /similarity scores?/i],
  ["/blog/why-same-person-different-ai-results", /(?:two )?photos of the same person/i],
]

// Style posts (any post whose body links Ollie Stylist) point readers to /ai-stylist, not the lookalike tool.
const isStylistPost = (post: BlogPost) => post.sections.some((s) => s.paragraphs.some((p) => p.includes('href="/ai-stylist"')))

function linkFirstMention(sections: BlogPost["sections"], slug: string, stylist: boolean) {
  const todo = LINK_RULES.filter(([href]) => href !== `/blog/${slug}` && !(stylist && href === "/celebrity-lookalike"))
  return sections.map((s) => ({
    ...s,
    paragraphs: s.paragraphs.map((p) => {
      for (let i = 0; i < todo.length; i++) {
        const [href, phrase] = todo[i]
        // skip paragraphs that already hold a link, so the phrase is never nested inside another <a>
        if (p.includes("<a ") || !phrase.test(p)) continue
        p = p.replace(phrase, (m) => `<a href="${href}" class="${bodyLink}">${m}</a>`)
        todo.splice(i--, 1)
      }
      return p
    }),
  }))
}

// Newest first, the same order as the blog list, so "Next" walks toward older posts
const byDate = [...allPosts].sort((a, b) => b.isoDate.localeCompare(a.isoDate))

function TableOfContents({ headings, ids }: { headings: string[]; ids: string[] }) {
  if (headings.length < 2) return null
  return (
    <nav aria-label="In this article" className={`${card} mb-10 p-6`}>
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
  const stylist = isStylistPost(post)
  const sections = linkFirstMention(post.sections, post.slug, stylist).map((s) => ({ ...s, id: s.h2 ? ids[h2Index++] : undefined }))
  const image = blogImages[post.slug]
  const relatedPosts = post.relatedSlugs.map((s) => getPost(s)).filter((p) => p !== undefined)
  // "Read more" links inside the article: after the 2nd and 4th sections, one related post each
  const readMoreAt = new Map([[1, relatedPosts[0]], [3, relatedPosts[1]]].filter(([, r]) => r) as [number, BlogPost][])
  const signupAt = sections.length >= 5 ? Math.floor(sections.length / 2) : -1 // email signup mid-article, long posts only
  const at = byDate.findIndex((p) => p.slug === post.slug)
  const newer = byDate[at - 1]
  const older = byDate[at + 1]
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
        image: image ? [`${SITE_URL}${image.src}`, `${url}/opengraph-image`] : `${url}/opengraph-image`,
        datePublished: post.isoDate,
        dateModified: modified,
        author: { "@type": "Person", name: post.author },
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
            <p className="text-white/80 text-lg leading-relaxed mb-6">{post.summary}</p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <AuthorBadge
                name={post.author}
                detail={`${post.date} · ${post.readTime}`}
              />
              <SocialButton url={url} title={post.title} />
            </div>
            <time dateTime={post.isoDate} className="sr-only">{post.date}</time>
          </header>

          {image && (
            <figure className="mb-10">
              {/* pre-sized WebP in public/, so no runtime optimisation needed */}
              <Image
                src={image.src}
                width={image.width}
                height={image.height}
                alt={image.alt}
                priority
                unoptimized
                className="max-h-[28rem] w-full rounded-3xl bg-white/[0.03] object-contain"
              />
              <figcaption className="mt-2 text-[11px] text-white/50">
                Image: <a href={image.sourceUrl} className="underline underline-offset-2 hover:text-white" rel="nofollow noopener" target="_blank">{image.credit}</a>
                {", "}
                {image.licenseUrl
                  ? <a href={image.licenseUrl} className="underline underline-offset-2 hover:text-white" rel="nofollow noopener license" target="_blank">{image.license}</a>
                  : image.license}
                {/* CC licences ask you to say when an image was changed; ours are resized and re-encoded */}
                , via Wikimedia Commons{image.license !== "Public domain" && image.license !== "CC0" ? " (resized)" : ""}
              </figcaption>
            </figure>
          )}

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
                {readMoreAt.has(i) && (
                  <p className="mb-4 text-white/65">
                    <strong className="text-white/85">Read more:</strong>{" "}
                    <Link href={`/blog/${readMoreAt.get(i)!.slug}`} className={bodyLink}>{readMoreAt.get(i)!.title}</Link>
                  </p>
                )}
                {i === signupAt && (
                  <div className="my-10">
                    <NewsletterForm source="blog" title="Get new guides by email" />
                  </div>
                )}
              </section>
            ))}
          </article>

          {/* FAQ */}
          {post.faqs.length > 0 && (
            <section className="mt-14">
              <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {post.faqs.map((faq, i) => (
                  <div key={i} className={`${card} p-5`}>
                    <h3 className="text-sm font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className={`${card} mt-14 p-7`}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-(--ollie-cyan) mb-2">Try it yourself</p>
            {stylist ? (
              <>
                <h2 className="text-xl font-bold text-white mb-2">Find what suits you with Ollie Stylist</h2>
                <p className="text-white/55 text-sm mb-5">
                  Scan your face for haircuts that suit its shape and dress a realistic model in real clothes. Free, and the face scan runs in your browser.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-2">Find your celebrity lookalike</h2>
                <p className="text-white/55 text-sm mb-5">
                  Upload a photo and see which celebrities you look most like. Free to try, and your photo is never stored.
                </p>
              </>
            )}
            <Link
              href={stylist ? "/ai-stylist" : "/celebrity-lookalike"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-(--ollie-cyan) text-black text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {stylist ? "Try Ollie Stylist free" : "Find my celebrity look alike"} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </section>


          {/* About the author */}
          <section className={`${card} mt-14 p-7`} aria-labelledby="about-author">
            <p id="about-author" className="text-[10px] font-bold tracking-widest uppercase text-(--ollie-cyan) mb-4">About the author</p>
            <AuthorBadge name={post.author} detail={stylist ? "Writes for Ollie Stylist, a free AI stylist" : "Writes for Ollie, a free celebrity lookalike AI"} />
            <p className="mt-4 text-white/60 text-sm leading-relaxed">
              The Ollie team wrote and trained Ollie&apos;s own face-recognition model from scratch, and writes these guides to
              explain how face matching works in plain English. Questions or corrections are welcome on the{" "}
              <Link href="/contact" className={bodyLink}>contact page</Link>, and the{" "}
              <Link href="/faq" className={bodyLink}>FAQ</Link> covers how Ollie works and what happens to your photo.
            </p>
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
                    className={`${card} group block p-5 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
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

          {/* Previous / next article */}
          <div className="mt-14">
            <PostPagination
              prev={newer ? { href: `/blog/${newer.slug}`, title: newer.title } : null}
              next={older ? { href: `/blog/${older.slug}`, title: older.title } : null}
            />
          </div>

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
