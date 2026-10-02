// Dynamic client registration (RFC 7591). ChatGPT POSTs its redirect_uris and gets a client_id back.
// Public clients only (PKCE, no secret).
import { NextResponse } from "next/server"
import { registerClient, canRegister, redirectAllowed, CORS } from "@/lib/oauth"
import { getIp } from "@/lib/rate-limit"

export async function POST(req: Request) {
  // Durable per-IP cap so open dynamic registration can't be used to flood the clients table.
  if (!(await canRegister(getIp(req)))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: CORS })
  }
  const body = await req.json().catch(() => null)
  const uris: string[] = Array.isArray(body?.redirect_uris) ? body.redirect_uris.filter((u: unknown) => typeof u === "string") : []
  // Loopback (native MCP clients) or https on a known vendor host — never an arbitrary attacker host (consent-phishing).
  if (!uris.length || !uris.every(redirectAllowed)) {
    console.error("oauth register rejected redirect_uris:", uris.join(" "))
    return NextResponse.json({ error: "invalid_redirect_uri" }, { status: 400, headers: CORS })
  }
  const client = await registerClient(uris, typeof body?.client_name === "string" ? body.client_name.slice(0, 120) : undefined)
  if (!client) return NextResponse.json({ error: "server_error" }, { status: 500, headers: CORS })
  return NextResponse.json(
    {
      client_id: client.client_id,
      client_name: client.client_name,
      redirect_uris: client.redirect_uris,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
    },
    { status: 201, headers: CORS },
  )
}
export function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
