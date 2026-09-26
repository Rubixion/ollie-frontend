"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { card } from "@/lib/surfaces"
import { AuthorBadge } from "@/components/author-badge"
import Image from "next/image"

export interface PostCard {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  author: string
  image?: string // card-size thumbnail
}

const PAGE = 12

// Only the card fields reach the browser; the full articles stay on the server.
// Every card is rendered and the extra ones only hidden, so all article links stay in the HTML for crawlers.
export function BlogList({ posts, categories }: { posts: PostCard[]; categories: string[] }) {
  const [category, setCategory] = useState("All")
  const [query, setQuery] = useState("")
  const [shown, setShown] = useState(PAGE)

  const q = query.trim().toLowerCase()
  const matches = (p: PostCard) =>
    (category === "All" || p.category === category) &&
    (!q || `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(q))
  const total = posts.filter(matches).length
  let visibleIndex = 0

  const pick = (c: string) => {
    setCategory(c)
    setShown(PAGE)
  }

  return (
    <>
      <div className="mx-auto max-w-xl">
        <label className="relative block">
          <span className="sr-only">Search articles</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShown(PAGE) }}
            placeholder="Search articles"
            className="w-full rounded-full bg-white/[0.05] py-3 pl-11 pr-4 text-sm text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.07)] placeholder:text-white/45 focus:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-(--ollie-cyan)/60"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => pick(c)}
            className={`min-h-9 rounded-full px-4 text-xs font-semibold transition-colors ${
              category === c ? "bg-(--ollie-cyan) text-black" : "bg-white/[0.05] text-white/65 hover:bg-white/[0.09] hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-white/55" aria-live="polite">
        {total === 0 ? "No articles match that search." : `Showing ${Math.min(shown, total)} of ${total} articles`}
      </p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const visible = matches(post) && visibleIndex++ < shown
          return (
            <li key={post.slug} className={visible ? "" : "hidden"}>
              <Link
                href={`/blog/${post.slug}`}
                className={`${card} group flex h-full flex-col transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-(--ollie-cyan) motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
              >
                {post.image && (
                  // decorative here: the title already names the link; the article's hero carries the alt text
                  <Image
                    src={post.image}
                    alt=""
                    width={640}
                    height={360}
                    unoptimized
                    className="aspect-video w-full bg-white/[0.03] object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                <span className="flex items-center gap-2 text-[11px]">
                  <span className="font-bold uppercase tracking-widest text-(--ollie-cyan)">{post.category}</span>
                  <span className="text-white/50">· {post.readTime}</span>
                </span>
                <h2 className="mt-3 text-base font-bold leading-snug text-white text-balance group-hover:text-(--ollie-cyan) transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/60">{post.excerpt}</p>
                <span className="mt-auto pt-5">
                  <AuthorBadge name={post.author} detail={post.date} />
                </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {shown < total && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className="min-h-11 rounded-full bg-white/[0.07] px-6 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12]"
          >
            Show more articles
          </button>
        </div>
      )}
    </>
  )
}
