// OAuth authorization endpoint (user-facing). Validates the request server-side, then shows the consent screen.
// If anything is invalid we render an error — we never redirect to an unvalidated redirect_uri (open-redirect guard).
import { getClient, validateClientRedirect, OAUTH_SCOPE } from "@/lib/oauth"
import { OAuthConsent } from "@/components/oauth-consent"

export const metadata = { title: "Connect to Ollie", robots: { index: false } }

type SP = Record<string, string | string[] | undefined>

export default async function AuthorizePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) as string | undefined

  const response_type = get("response_type")
  const client_id = get("client_id") ?? ""
  const redirect_uri = get("redirect_uri") ?? ""
  const code_challenge = get("code_challenge") ?? ""
  const code_challenge_method = get("code_challenge_method") ?? ""
  const scope = get("scope") ?? OAUTH_SCOPE
  const state = get("state") ?? ""

  const ok =
    response_type === "code" &&
    !!code_challenge &&
    code_challenge_method === "S256" &&
    (await validateClientRedirect(client_id, redirect_uri))

  if (!ok) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <h1 className="text-xl font-bold text-white">Invalid sign-in request</h1>
          <p className="mt-3 text-sm text-white/60">
            This connection link is missing or invalid. Start again from the app that sent you here.
          </p>
        </div>
      </main>
    )
  }

  const client = await getClient(client_id)
  return (
    <OAuthConsent
      clientName={client?.client_name || "An application"}
      clientId={client_id}
      redirectUri={redirect_uri}
      codeChallenge={code_challenge}
      codeChallengeMethod={code_challenge_method}
      scope={scope}
      state={state}
    />
  )
}
