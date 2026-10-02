// A signed-in user's connected apps (ChatGPT, etc.) — list and disconnect. Authenticated with the user's Supabase
// session (Bearer), so it's CSRF-safe. A future account page can render this; the capability exists now either way.
import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-server"
import { listConnections, revokeUserConnections } from "@/lib/oauth"

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  return NextResponse.json({ connections: await listConnections(user.id) })
}

// DELETE ?client_id=... disconnects one app; no client_id disconnects them all. Takes effect immediately.
export async function DELETE(req: Request) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const client_id = new URL(req.url).searchParams.get("client_id") ?? undefined
  await revokeUserConnections(user.id, client_id)
  return NextResponse.json({ ok: true })
}
