import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-config"

// Everything crawlable except the API. Blocking AI-training crawlers (GPTBot, ClaudeBot,
// Google-Extended, CCBot) is an open question for the owner; add rules here once decided.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
