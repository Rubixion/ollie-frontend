import type { NextConfig } from "next"

// Cloudflare Web Analytics (enabled in the Cloudflare dashboard) injects this beacon; it reports real-user LCP/INP/CLS.
// public/ files (e.g. /chemistry) are served by Cloudflare's asset layer and never get these headers.
// extra = { script, connect } sources for one page: the /ai-stylist scanner and /face-symmetry-test (MediaPipe WASM + model).
const makeCsp = (extra = { script: "", connect: "" }) => [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com${extra.script}${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cloudflareinsights.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://formspree.io${extra.connect}`, // formspree.io: the contact form posts there
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")
const csp = makeCsp()
const styleCsp = makeCsp({
  script: " 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  connect: " https://cdn.jsdelivr.net https://storage.googleapis.com",
})

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      // Hidden /ai-stylist page: its live face scan needs the camera and MediaPipe. Later rules override earlier ones.
      {
        source: "/ai-stylist",
        headers: [
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: styleCsp },
        ],
      },
      // Hidden /face-symmetry-test: MediaPipe on an uploaded photo (no camera), so only the CSP changes
      { source: "/face-symmetry-test", headers: [{ key: "Content-Security-Policy", value: styleCsp }] },
    ]
  },
}

export default nextConfig

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
