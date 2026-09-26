import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { allPosts, allCategories } from "@/lib/blog-posts"
import { SITE_URL } from "@/lib/site-config"
import { BlogList } from "./blog-list"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { blogImages } from "@/lib/blog-images"

// Newest first
const posts = [...allPosts].sort((a, b) => b.isoDate.localeCompare(a.isoDate))

// Above the fold, so it loads in on its own (same as the contact page)
const loadIn = "animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-backwards motion-reduce:animate-none"

export default function BlogPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: "The Ollie Blog",
    url: `${SITE_URL}/blog`,
    description: "How face recognition works, how to get your best celebrity match, and why people look alike.",
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.isoDate,
      dateModified: p.updatedIsoDate ?? p.isoDate,
      author: { "@type": "Person", name: p.author },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-[clamp(5rem,12svh,8rem)]">
          <div className="text-center">
            <h1 className="fluid-h1-sm font-black text-white tracking-[-0.015em] leading-[1.05] text-balance">The Ollie Blog</h1>
            <p className="mx-auto mt-[clamp(0.5rem,2svh,1rem)] max-w-xl text-base leading-relaxed text-white/70 text-pretty">
              How face recognition works, how to get your best celebrity match, and the science of why people look alike.
            </p>
          </div>

          <div className={`mt-[clamp(1.5rem,4svh,2.5rem)] ${loadIn}`}>
            <BlogList
              posts={posts.map(({ slug, title, excerpt, date, readTime, category, author }) => {
                const img = blogImages[slug]
                return { slug, title, excerpt, date, readTime, category, author, image: img?.thumb }
              })}
              categories={allCategories}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
