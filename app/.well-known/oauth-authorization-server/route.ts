// OAuth 2.1 authorization server metadata (RFC 8414). ChatGPT fetches this to learn our endpoints.
import { NextResponse } from "next/server"
import { authServerMetadata, CORS } from "@/lib/oauth"

export function GET() {
  return NextResponse.json(authServerMetadata(), { headers: CORS })
}
export function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
