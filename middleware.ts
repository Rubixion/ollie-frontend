import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { COMING_SOON } from "@/lib/site-config"

const ALLOWED_PREFIXES = ["/chemistry", "/api", "/robots.txt", "/sitemap.xml", "/opengraph-image", "/icon", "/favicon.ico"]

export function middleware(request: NextRequest) {
  if (!COMING_SOON) return NextResponse.next()

  const { pathname } = request.nextUrl
  if (pathname === "/" || ALLOWED_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  return NextResponse.rewrite(new URL("/", request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
