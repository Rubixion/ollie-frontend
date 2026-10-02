// Mints an authorization code after the signed-in user approves on /oauth/authorize.
// Called by the consent page with the user's Supabase access token; never by ChatGPT directly.
import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-server"
import { issueCode, validateClientRedirect, OAUTH_SCOPE } from "@/lib/oauth"

export async function POST(req: Request) {
  const user = await getAuthUser(req) // Supabase Bearer -> the approving user
  if (!user) return NextResponse.json({ error: "not_signed_in" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const client_id = String(body?.client_id ?? "")
  const redirect_uri = String(body?.redirect_uri ?? "")
  const code_challenge = String(body?.code_challenge ?? "")
  const method = String(body?.code_challenge_method ?? "")

  if (method !== "S256" || !code_challenge) return NextResponse.json({ error: "invalid_request" }, { status: 400 })
  if (!(await validateClientRedirect(client_id, redirect_uri))) return NextResponse.json({ error: "invalid_client" }, { status: 400 })

  const code = await issueCode({ client_id, user_id: user.id, redirect_uri, code_challenge, scope: OAUTH_SCOPE })
  if (!code) return NextResponse.json({ error: "server_error" }, { status: 500 })
  return NextResponse.json({ code })
}
