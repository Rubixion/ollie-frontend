import type { BlogPost } from "./blog-post-types"
import { postsA } from "./blog-posts-a"
import { postsB } from "./blog-posts-b"
import { postsC } from "./blog-posts-c"

export type { BlogPost }

// Shown date is the full day from isoDate ("January 14, 2026"), so the two can't disagree.
const fullDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })

export const allPosts: BlogPost[] = [...postsA, ...postsB, ...postsC].map((p) => ({ ...p, date: fullDate(p.isoDate) }))

export function getPost(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug)
}

export const allCategories: string[] = [
  "All",
  ...Array.from(new Set(allPosts.map((p) => p.category))),
]
