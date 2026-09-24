import { allPosts } from "@/lib/blog-posts"
import { SITE_URL } from "@/lib/site-config"

// RSS feed of the blog (linked from every blog page's <head>), rebuilt on each deploy.
export const dynamic = "force-static"

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

export function GET() {
  const posts = [...allPosts].sort((a, b) => b.isoDate.localeCompare(a.isoDate))
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${p.isoDate}T12:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.excerpt)}</description>
    </item>`
    })
    .join("\n")
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Ollie Blog</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>How face recognition works, how to get your best celebrity match, and why people look alike.</description>
    <language>en</language>
    <lastBuildDate>${new Date(`${posts[0].updatedIsoDate ?? posts[0].isoDate}T12:00:00Z`).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } })
}
