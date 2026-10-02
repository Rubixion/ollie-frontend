import type { BlogPost } from "./blog-post-types"
import { postsA } from "./blog-posts-a"
import { postsB } from "./blog-posts-b"
import { postsC } from "./blog-posts-c"
import { postsD } from "./blog-posts-d"
import { postsE } from "./blog-posts-e"
import { postsF } from "./blog-posts-f"
import { postsG } from "./blog-posts-g"
import { postsH } from "./blog-posts-h"
import { postsI } from "./blog-posts-i"
import { postsJ } from "./blog-posts-j"
import { postsK } from "./blog-posts-k"
import { postsL } from "./blog-posts-l"

export type { BlogPost }

// isoDate is a day ("2026-09-26") or, for posts with a publish time, a UTC date-time ("2026-09-14T09:32:00Z").
export const postDate = (iso: string, time = "00:00:00") => new Date(iso.length === 10 ? `${iso}T${time}Z` : iso)

// Shown date is the full day from isoDate ("January 14, 2026"), so the two can't disagree.
const fullDate = (iso: string) =>
  postDate(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })

export const allPosts: BlogPost[] = [...postsA, ...postsB, ...postsC, ...postsD, ...postsE, ...postsF, ...postsG, ...postsH, ...postsI, ...postsJ, ...postsK, ...postsL].map((p) => ({ ...p, date: fullDate(p.isoDate) }))

export function getPost(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug)
}

export const allCategories: string[] = [
  "All",
  ...Array.from(new Set(allPosts.map((p) => p.category))),
]
