// OAuth token endpoint (form-encoded, RFC 6749). Handles authorization_code (with PKCE) and refresh_token.
import { NextResponse } from "next/server"
import { consumeCode, issueTokens, rotateRefreshToken, verifyPkce, CORS } from "@/lib/oauth"

const json = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { ...CORS, "Cache-Control": "no-store" } })

export async function POST(req: Request) {
  const form = new URLSearchParams(await req.text())
  const grant = form.get("grant_type")
  const client_id = form.get("client_id") ?? ""

  if (grant === "authorization_code") {
    const code = form.get("code") ?? ""
    const verifier = form.get("code_verifier") ?? ""
    const redirect_uri = form.get("redirect_uri") ?? ""
    if (!code || !verifier || !client_id || !redirect_uri) return json({ error: "invalid_request" }, 400)
    const row = await consumeCode(code, client_id, redirect_uri)
    if (!row) return json({ error: "invalid_grant" }, 400)
    if (!(await verifyPkce(verifier, row.code_challenge))) return json({ error: "invalid_grant" }, 400)
    const tokens = await issueTokens(row.user_id, client_id, row.scope)
    if (!tokens) return json({ error: "server_error" }, 500)
    return json({ token_type: "Bearer", ...tokens })
  }

  if (grant === "refresh_token") {
    const refresh = form.get("refresh_token") ?? ""
    if (!refresh || !client_id) return json({ error: "invalid_request" }, 400)
    const tokens = await rotateRefreshToken(refresh, client_id)
    if (!tokens) return json({ error: "invalid_grant" }, 400)
    return json({ token_type: "Bearer", ...tokens })
  }

  return json({ error: "unsupported_grant_type" }, 400)
}
export function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
