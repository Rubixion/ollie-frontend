import type { Metadata } from "next"
import { allPosts } from "@/lib/blog-posts"

export const metadata: Metadata = {
  title: "Blog: Face Recognition, AI and Celebrity Lookalikes",
  description: `${allPosts.length} guides on how face recognition works, how to get your best celebrity match, and the science of why people look alike.`,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "The Ollie Blog" }] },
  },
  openGraph: {
    title: "The Ollie Blog",
    description: "How face recognition works, how to get your best celebrity match, and why people look alike.",
    url: "/blog",
    siteName: "Ollie",
    type: "website",
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
