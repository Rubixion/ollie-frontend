import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { COMING_SOON, MATCH_ONLY } from "@/lib/site-config"

const ALLOWED_PREFIXES = ["/chemistry", "/api", "/robots.txt", "/sitemap.xml", "/opengraph-image", "/icon", "/favicon.ico"]
const MATCH_ONLY_ALLOWED = ["/match", "/api", "/robots.txt", "/sitemap.xml", "/opengraph-image", "/icon", "/favicon.ico"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (MATCH_ONLY) {
    if (MATCH_ONLY_ALLOWED.some(p => pathname.startsWith(p))) return NextResponse.next()
    return NextResponse.redirect(new URL("/match", request.url))
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
