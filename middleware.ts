import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { COMING_SOON, MATCH_ONLY, SITE_URL } from "@/lib/site-config"

// Old domain and the bare new domain: 308 to the same path on SITE_URL (site moved from ollie.ml on 2026-09-26).
// ponytail: Worker handles it so it works whatever Cloudflare rules exist; keep until Google has moved the index (~6+ months).
const OLD_HOSTS = ["ollie.ml", "www.ollie.ml", "ollieml.com"]

const ALLOWED_PREFIXES = ["/chemistry", "/api", "/robots.txt", "/sitemap.xml", "/opengraph-image", "/icon", "/favicon.ico"]
// Pages that exist but aren't live in the match-only release: permanently redirected to /match.
// Anything not listed here and not a real route falls through to the 404 page (no soft 404s).
// Live: /, /match, /blog, /contact, /privacy, /terms.
const HIDDEN_PAGES = ["/ai", "/about", "/projects", "/info", "/search", "/chemistry"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (OLD_HOSTS.includes(request.headers.get("host") ?? "")) {
    return NextResponse.redirect(new URL(pathname + request.nextUrl.search, SITE_URL), 308)
  }

  if (MATCH_ONLY) {
    const path = pathname.replace(/\/+$/, "") || "/"
    if (HIDDEN_PAGES.includes(path)) return NextResponse.redirect(new URL("/match", request.url), 308)
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
