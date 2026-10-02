import type { MetadataRoute } from "next"
import { allPosts } from "@/lib/blog-posts"
import { HOME_UPDATED, LOOK_ALIKE_LIVE, LOOK_ALIKE_UPDATED, SITE_URL, STYLIST_UPDATED, SYMMETRY_LIVE, SYMMETRY_UPDATED } from "@/lib/site-config"
import { lookAlikePages } from "@/lib/look-alike"

// Only URLs that return 200 (under MATCH_ONLY the other pages redirect to /celebrity-lookalike).
// Fixed dates: bump one when that page's content really changes, so crawlers can trust lastModified.
const LEGAL_UPDATED = "2026-09-26"

export default function sitemap(): MetadataRoute.Sitemap {
  const latestPost = allPosts.map((p) => p.updatedIsoDate ?? p.isoDate).sort().at(-1) ?? HOME_UPDATED
  return [
    { url: SITE_URL, lastModified: HOME_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/celebrity-lookalike`, lastModified: HOME_UPDATED, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE_URL}/compare-faces`, lastModified: HOME_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/ai-stylist`, lastModified: STYLIST_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/faq`, lastModified: HOME_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: latestPost, changeFrequency: "weekly", priority: 0.8 },
    ...allPosts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedIsoDate ?? post.isoDate,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...(LOOK_ALIKE_LIVE
      ? [
          { url: `${SITE_URL}/look-alike`, lastModified: LOOK_ALIKE_UPDATED, changeFrequency: "monthly" as const, priority: 0.7 },
          ...lookAlikePages.map((p) => ({ url: `${SITE_URL}/look-alike/${p.slug}`, lastModified: LOOK_ALIKE_UPDATED, changeFrequency: "yearly" as const, priority: 0.6 })),
        ]
      : []),
    ...(SYMMETRY_LIVE ? [{ url: `${SITE_URL}/face-symmetry-test`, lastModified: SYMMETRY_UPDATED, changeFrequency: "monthly" as const, priority: 0.8 }] : []),
    { url: `${SITE_URL}/contact`, lastModified: HOME_UPDATED, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ]
}
