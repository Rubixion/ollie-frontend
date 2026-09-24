"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export interface PostCard {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
}

// Only the card fields reach the browser; the full articles stay on the server.
export function BlogList({ posts, categories }: { posts: PostCard[]; categories: string[] }) {
  const [activeCategory, setActiveCategory] = useState("All")
  const filtered = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory)

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeCategory === cat
                ? "bg-(--ollie-cyan) text-black border-(--ollie-cyan)"
                : "text-white/60 border-white/10 hover:border-white/30 hover:text-white/70"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block p-7 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/20 hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-(--ollie-cyan)">
                {post.category}
              </span>
              <span className="text-white/60 text-xs">{post.date}</span>
              <span className="text-white/60 text-xs">{post.readTime}</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-1.5 group-hover:text-white/90 transition-colors leading-snug">
              {post.title}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-3">{post.excerpt}</p>
            <span className="inline-flex items-center gap-1 text-white/60 text-xs group-hover:text-white/60 transition-colors">
              Read article <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-white/60 text-sm py-10 text-center">No articles in this category yet.</p>
      )}
    </>
  )
}
