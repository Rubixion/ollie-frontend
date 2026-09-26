import { ImageResponse } from "next/og"

// The 1200x630 share-preview card used by every opengraph-image route.
// No `runtime = "edge"` in those routes: OpenNext on Cloudflare doesn't support it.
export const OG_SIZE = { width: 1200, height: 630 }
const BLUE = "rgb(100, 130, 210)" // --ollie-cyan in globals.css

export function ogCard(title: string, subtitle: string) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#000",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        color: "#fff",
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: "0.12em" }}>OLLIE</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.02em", maxWidth: 1040 }}>{title}</div>
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.72)", maxWidth: 900, lineHeight: 1.35 }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", fontSize: 28, color: BLUE, fontWeight: 700 }}>ollieml.com</div>
    </div>,
    OG_SIZE
  )
}
