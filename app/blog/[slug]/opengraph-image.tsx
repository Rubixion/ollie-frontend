import { ImageResponse } from "next/og"
import { allPosts, getPost } from "@/lib/blog-posts"

// Per-article social card, in the same style as the site-wide one (app/opengraph-image.tsx).
// Rendered once per post at build time (generateStaticParams), then served as a static PNG.
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Ollie blog article"

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  const title = post?.title ?? "The Ollie Blog"
  return new ImageResponse(
    <div
      style={{
        background: "#000000",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(100,130,210,0.16) 0%, transparent 70%)",
          top: -120,
          right: -200,
        }}
      />
      <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "rgb(100,130,210)", position: "relative" }}>
        {post?.category ?? "Blog"}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: title.length > 70 ? 54 : 64,
          fontWeight: 900,
          color: "#ffffff",
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          position: "relative",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 900, color: "#ffffff", letterSpacing: "0.15em" }}>OLLIE</div>
        <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.45)" }}>ollieml.com/blog</div>
      </div>
    </div>,
    size,
  )
}
