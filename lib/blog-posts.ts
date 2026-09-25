import type { BlogPost } from "./blog-post-types"
import { postsA } from "./blog-posts-a"
import { postsB } from "./blog-posts-b"
import { postsC } from "./blog-posts-c"

export type { BlogPost }

export const allPosts: BlogPost[] = [...postsA, ...postsB, ...postsC]

export function getPost(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug)
}

// The best guides, linked from the homepage, blog index and footer. Order = link order.
export const featuredPosts: BlogPost[] = [
  "find-your-celebrity-lookalike",
  "best-photo-celebrity-match",
  "understanding-your-results",
  "ollie-how-it-works",
  "celebrity-database-how-built",
  "why-everyone-has-doppelganger",
].map((slug) => {
  const post = getPost(slug)
  if (!post) throw new Error(`featuredPosts: no post with slug "${slug}"`) // fail the build, not a page
  return post
})

export const allCategories: string[] = [
  "All",
  ...Array.from(new Set(allPosts.map((p) => p.category))),
]
