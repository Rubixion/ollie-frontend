"use client"

import { useState } from "react"
import { Check, Loader2, Mail } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

// Joins the email list that the signup form's opt-in box feeds (/api/consent, supabase/user_consents.sql).
// Signed out: opens the signup modal, then subscribes once they're in. Clicking the button is the consent.
export function MailingListButton({ className = "" }: { className?: string }) {
  const { user, openModal } = useAuth()
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle")

  const subscribe = async () => {
    setState("busy")
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    const res = token
      ? await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ emailOptIn: true }),
        }).catch(() => null)
      : null
    setState(res?.ok ? "done" : "error")
  }

  if (state === "done") {
    return (
      <p role="status" className={`inline-flex items-center gap-2 text-sm font-semibold text-(--ollie-cyan) ${className}`}>
        <Check size={16} aria-hidden="true" />
        You&apos;re on the list. We&apos;ll email you when Search launches.
      </p>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => (user ? subscribe() : openModal(subscribe, "signup"))}
        disabled={state === "busy"}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-(--ollie-cyan)/50 px-5 text-sm font-bold text-(--ollie-cyan) transition-colors hover:bg-(--ollie-cyan)/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"
      >
        {state === "busy" ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}
        Join the mailing list
      </button>
      <p className="text-xs text-white/50">
        {state === "error" ? "Couldn't add you. Try again in a moment." : `${user ? "" : "Free account needed. "}Occasional emails about new features. Unsubscribe any time.`}
      </p>
    </div>
  )
}
