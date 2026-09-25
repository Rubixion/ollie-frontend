import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { allPosts, allCategories, featuredPosts } from "@/lib/blog-posts"
import { SITE_URL } from "@/lib/site-config"
import { BlogList } from "./blog-list"
import { BGPattern } from "@/components/bg-pattern"

// Newest first
const posts = [...allPosts].sort((a, b) => b.isoDate.localeCompare(a.isoDate))

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
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <BGPattern variant="grid" mask="fade-edges" fill="rgba(255,255,255,0.04)" size={32} className="fixed" />
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">The Ollie Blog</h1>
            <p className="text-white/50 text-base max-w-2xl leading-relaxed">
              How face recognition works, how to get your best celebrity match, and the science of why people look alike.
              {" "}{posts.length} articles.
            </p>
          </div>
          <section aria-labelledby="start-here" className="mb-14 border-y border-white/10 py-8">
            <h2 id="start-here" className="text-2xl font-black text-white tracking-tight">Start here</h2>
            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {featuredPosts.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="text-(--ollie-cyan) underline underline-offset-4 hover:text-white">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <BlogList
            posts={posts.map(({ slug, title, excerpt, date, readTime, category }) => ({ slug, title, excerpt, date, readTime, category }))}
            categories={allCategories}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
