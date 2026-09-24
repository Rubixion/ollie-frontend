import { ImageResponse } from "next/og"
import { INDEX } from "@/lib/facts"

// No `runtime = "edge"`: OpenNext on Cloudflare doesn't support it (the live route returned 500).
// Static (no request data), so it's rendered once at build time. Also used for twitter:image.
export const alt = "Ollie: which celebrity do you look like?"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BLUE = "rgb(100, 130, 210)" // --ollie-cyan in globals.css

export default function OGImage() {
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
        <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.02em", maxWidth: 980 }}>
          Which celebrity do you look like?
        </div>
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.72)", maxWidth: 900, lineHeight: 1.35 }}>
          {`Upload a photo and a face-recognition model ranks ${INDEX.celebrities} celebrities by how much they look like you.`}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: BLUE, fontWeight: 700 }}>
        ollie.ml
      </div>
    </div>,
    size
  )
}
