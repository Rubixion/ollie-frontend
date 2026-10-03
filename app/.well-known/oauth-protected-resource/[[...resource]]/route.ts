// Protected-resource metadata (RFC 9728). ChatGPT derives the path from the MCP URL, e.g.
// /.well-known/oauth-protected-resource/mcp  and  .../mcp/symmetry — a catch-all covers all three apps.
import { NextResponse } from "next/server"
import { protectedResourceMetadata, CORS, ISSUER } from "@/lib/oauth"

export async function GET(_req: Request, { params }: { params: Promise<{ resource?: string[] }> }) {
  const seg = (await params).resource?.join("/") ?? ""
  // Only the apps with sign-in advertise OAuth. The symmetry app has none, and the bare root is 404 too: clients
  // (and the OpenAI portal's auth detection) fall back to the root when the path-specific URL 404s, which made
  // /mcp/symmetry look like an OAuth server. The /mcp alias (claude.ai connector) still has its own path.
  if (!/^mcp(\/(lookalike|stylist))?$/.test(seg)) return new NextResponse(null, { status: 404, headers: CORS })
  return NextResponse.json(protectedResourceMetadata(`${ISSUER}/${seg}`), { headers: CORS })
}
export function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
