"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

// The one click on /unsubscribe. A button (a POST), not the link itself, so email scanners that open links
// can't unsubscribe anyone.
export function UnsubscribeButton({ email, token }: { email: string; token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle")

  const unsubscribe = async () => {
    setState("busy")
    const res = await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    }).catch(() => null)
    setState(res?.ok ? "done" : "error")
  }

  if (state === "done") return <p role="status" className="font-medium text-(--ollie-cyan)">Done. You won&apos;t get any more emails from Ollie.</p>
  return (
    <div className="space-y-3">
      <Button variant="brand" size="cta" onClick={unsubscribe} disabled={state === "busy"}>
        {state === "busy" ? "Unsubscribing…" : "Unsubscribe"}
      </Button>
      {state === "error" && <p role="alert" className="text-sm text-red-300">That didn&apos;t work. Try again, or email us and we&apos;ll do it by hand.</p>}
    </div>
  )
}
