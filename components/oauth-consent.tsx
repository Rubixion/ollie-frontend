"use client"

// Consent screen for the OAuth flow (/oauth/authorize). Signs the user in with their existing Ollie account,
// then, on Allow, asks /oauth/grant for an authorization code and redirects back to the client (ChatGPT).
// UI is composed from existing primitives (Button) — no new visual components.
import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

type Props = {
  clientName: string
  clientId: string
  redirectUri: string
  codeChallenge: string
  codeChallengeMethod: string
  scope: string
  state: string
}

export function OAuthConsent(props: Props) {
  const { user, loading, openModal } = useAuth()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const back = (params: Record<string, string>) => {
    const url = new URL(props.redirectUri)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    if (props.state) url.searchParams.set("state", props.state)
    window.location.href = url.toString()
  }

  const deny = () => back({ error: "access_denied" })

  const allow = async () => {
    setBusy(true)
    setErr(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setErr("Your session expired. Please sign in again.")
        setBusy(false)
        return
      }
      const res = await fetch("/oauth/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          client_id: props.clientId,
          redirect_uri: props.redirectUri,
          code_challenge: props.codeChallenge,
          code_challenge_method: props.codeChallengeMethod,
          scope: props.scope,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.code) {
        setErr("Could not connect. Please try again.")
        setBusy(false)
        return
      }
      back({ code: data.code })
    } catch {
      setErr("Could not connect. Please try again.")
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-(--ollie-cyan)/10 text-(--ollie-cyan)">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-white">Connect to Ollie</h1>
            <p className="text-xs text-white/50">{props.clientName} wants to use your Ollie account</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-white/50">Loading…</p>
        ) : !user ? (
          <>
            <p className="text-sm leading-relaxed text-white/70">
              Sign in to connect <span className="text-white">{props.clientName}</span> to your Ollie account. You&apos;ll get
              your account&apos;s daily searches instead of a single free one.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {/* Both open the site's sign-in modal (Google or email inside), on the matching tab */}
              <Button variant="brand" size="cta" onClick={() => openModal(undefined, "signin")}>Log in</Button>
              <Button variant="brandOutline" size="cta" onClick={() => openModal(undefined, "signup")}>Sign up</Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-white/70">
              <span className="text-white">{props.clientName}</span> will connect to your Ollie account
              {user.email ? <> (<span className="text-white">{user.email}</span>)</> : null} and be able to:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/60">
              <li>Run your celebrity lookalike, face compare and stylist searches</li>
              <li>Count those searches against your account&apos;s daily limit</li>
            </ul>
            <p className="mt-3 text-xs text-white/40">It cannot read your photos after a result is returned — nothing is stored.</p>
            {(() => {
              let host = ""
              try { host = new URL(props.redirectUri).host } catch {}
              return host ? (
                <p className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/50">
                  Your authorization will be sent to <span className="font-semibold text-white/80">{host}</span>. Only continue if you recognise it.
                </p>
              ) : null
            })()}
            {err && <p className="mt-4 text-sm text-red-400">{err}</p>}
            <div className="mt-6 flex gap-3">
              <Button variant="brand" size="cta" className="flex-1" onClick={allow} disabled={busy}>
                {busy ? "Connecting…" : "Allow"}
              </Button>
              <Button variant="brandOutline" size="cta" className="flex-1" onClick={deny} disabled={busy}>Deny</Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
