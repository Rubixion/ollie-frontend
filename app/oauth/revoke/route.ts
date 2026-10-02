// OAuth token revocation (RFC 7009). Public clients, so no client auth. Always returns 200 (never leak whether a
// token existed). ChatGPT calls this when a user disconnects the app on its side.
import { NextResponse } from "next/server"
import { revokeToken, CORS } from "@/lib/oauth"

export async function POST(req: Request) {
  const token = new URLSearchParams(await req.text()).get("token")
  if (token) await revokeToken(token)
  return new NextResponse(null, { status: 200, headers: CORS })
}
export function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
