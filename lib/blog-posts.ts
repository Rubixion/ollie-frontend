import type { BlogPost } from "./blog-post-types"
import { postsA } from "./blog-posts-a"
import { postsB } from "./blog-posts-b"
import { postsC } from "./blog-posts-c"

export type { BlogPost }

export const allPosts: BlogPost[] = [...postsA, ...postsB, ...postsC]

export function getPost(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug)
}

export const allCategories: string[] = [
  "All",
  ...Array.from(new Set(allPosts.map((p) => p.category))),
]
