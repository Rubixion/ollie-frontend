import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { COMING_SOON, MATCH_ONLY, SITE_URL } from "@/lib/site-config"
import { currencyFor } from "@/lib/style/plans"

// Old domain and the bare new domain: 308 to the same path on SITE_URL (site moved from ollie.ml on 2026-09-26).
// ponytail: Worker handles it so it works whatever Cloudflare rules exist; keep until Google has moved the index (~6+ months).
const OLD_HOSTS = ["ollie.ml", "www.ollie.ml", "ollieml.com"]

// Renamed URLs (2026-10-01, keyword slugs). Keep forever: old links, shares and cards shared before the rename use them.
// Exact paths only: public/style/* assets keep their folder name and must not redirect.
const MOVED: Record<string, string> = {
  "/match": "/celebrity-lookalike",
  "/compare": "/compare-faces",
  "/style": "/ai-stylist",
  // merged into the stronger post on the same topic
  "/blog/inside-ai-face-matching": "/blog/how-face-recognition-works",
  "/blog/what-is-a-facial-fingerprint": "/blog/what-is-facial-embedding",
  "/blog/cross-age-celebrity-match": "/blog/aging-face-recognition",
  "/blog/twins-different-celebrity": "/blog/identical-twins-different-profiles",
  "/blog/face-symmetry-and-genetics": "/blog/symmetrical-faces",
  "/blog/why-two-networks": "/blog/siamese-neural-networks-explained",
  // renamed
  "/blog/siamese-versatility": "/blog/siamese-network-applications",
  "/blog/math-behind-your-face": "/blog/face-recognition-math",
  "/blog/science-of-you-look-like": "/blog/why-people-say-you-look-like-someone",
  // removed 2026-10-01 (off-topic, near-zero search traffic): sent to the closest surviving post
  "/blog/face-recognition-surveillance": "/blog/privacy-and-face-recognition",
  "/blog/face-recognition-in-medicine": "/blog/how-face-recognition-works",
  "/blog/face-recognition-genealogy": "/blog/celebrities-who-look-alike",
  "/blog/face-recognition-animals": "/blog/brain-recognises-face",
  "/blog/face-recognition-mental-health": "/blog/celebrity-resemblance-and-self-image",
  "/blog/face-spoof-detection": "/blog/how-face-recognition-works",
  "/blog/face-hashing-privacy": "/blog/privacy-and-face-recognition",
  "/blog/face-recognition-performance-tricks": "/blog/how-face-recognition-works",
  "/blog/future-of-face-recognition": "/blog/history-of-face-recognition",
  "/blog/face-recognition-with-mask": "/blog/glasses-hats-hair",
  "/blog/face-recognition-in-art": "/blog/celebrity-doppelgangers-throughout-history",
  "/blog/face-recognition-in-dating": "/blog/celebrity-resemblance-and-self-image",
  "/blog/face-recognition-aging-brain": "/blog/face-memory-psychology",
  "/blog/baby-face-recognition-development": "/blog/brain-recognises-face",
  "/blog/culture-and-face-recognition": "/blog/own-race-effect",
  "/blog/transfer-learning-explained": "/blog/training-data-matters",
  "/blog/what-overfitting-means": "/blog/training-data-matters",
}

const ALLOWED_PREFIXES = ["/chemistry", "/api", "/robots.txt", "/sitemap.xml", "/opengraph-image", "/icon", "/favicon.ico"]
// Pages that exist but aren't live in the match-only release: permanently redirected to /celebrity-lookalike.
// Anything not listed here and not a real route falls through to the 404 page (no soft 404s).
// Live: /, /celebrity-lookalike, /compare-faces, /ai-stylist, /faq, /blog, /contact, /privacy, /terms.
const HIDDEN_PAGES = ["/ai", "/about", "/projects", "/info", "/chemistry"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // One hop for both cases: an old host and a renamed path go straight to the final URL.
  const target = MOVED[pathname.replace(/\/+$/, "")]
  const oldHost = OLD_HOSTS.includes(request.headers.get("host") ?? "")
  if (target || oldHost) {
    return NextResponse.redirect(new URL((target ?? pathname) + request.nextUrl.search, oldHost ? SITE_URL : request.url), 308)
  }

  // Guests asking "am I Pro?" (every /ai-stylist visit, twice): the answer is always no, so answer here instead of
  // booting the Next.js server, which alone can blow the free Workers plan's 10 ms CPU limit (error 1102).
  if (pathname === "/api/pro" && request.method === "GET" && !request.headers.get("authorization")) {
    return NextResponse.json({ pro: false, currency: currencyFor(request.headers.get("cf-ipcountry")) })
  }

  if (MATCH_ONLY) {
    const path = pathname.replace(/\/+$/, "") || "/"
    if (HIDDEN_PAGES.includes(path)) return NextResponse.redirect(new URL("/celebrity-lookalike", request.url), 308)
    return NextResponse.next()
  }

  if (!COMING_SOON) return NextResponse.next()

  if (pathname === "/" || ALLOWED_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  return NextResponse.rewrite(new URL("/", request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
