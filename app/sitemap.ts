import type { MetadataRoute } from "next"
import { allPosts } from "@/lib/blog-posts"
import { SITE_URL } from "@/lib/site-config"

// Only URLs that return 200 (under MATCH_ONLY the other pages redirect to /match).
// Fixed dates: bump one when that page's content really changes, so crawlers can trust lastModified.
const MATCH_UPDATED = "2026-09-23"
const LEGAL_UPDATED = "2026-09-23"

export default function sitemap(): MetadataRoute.Sitemap {
  const latestPost = allPosts.map((p) => p.updatedIsoDate ?? p.isoDate).sort().at(-1) ?? MATCH_UPDATED
  return [
    { url: `${SITE_URL}/match`, lastModified: MATCH_UPDATED, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: latestPost, changeFrequency: "weekly", priority: 0.8 },
    ...allPosts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedIsoDate ?? post.isoDate,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/contact`, lastModified: MATCH_UPDATED, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ]
}
