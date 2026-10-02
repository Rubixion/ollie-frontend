// Protected-resource metadata (RFC 9728). ChatGPT derives the path from the MCP URL, e.g.
// /.well-known/oauth-protected-resource/mcp  and  .../mcp/symmetry — a catch-all covers all three apps.
import { NextResponse } from "next/server"
import { protectedResourceMetadata, CORS, ISSUER } from "@/lib/oauth"

export async function GET(_req: Request, { params }: { params: Promise<{ resource?: string[] }> }) {
  const seg = (await params).resource?.join("/") || "mcp"
  // the symmetry app has no login, so it advertises no OAuth (ChatGPT would otherwise offer "Connect")
  if (seg === "mcp/symmetry") return new NextResponse(null, { status: 404, headers: CORS })
  return NextResponse.json(protectedResourceMetadata(`${ISSUER}/${seg}`), { headers: CORS })
}
export function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
