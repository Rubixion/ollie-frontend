"use client"

// /ai-stylist opens straight on the editor with a dressed model; no questions first. The face scan and the Pro popup
// come up in context, from inside the editor.
import { useState } from "react"
import { StyleEditor } from "@/components/style-editor"
import { StylePlans } from "@/components/style-plans"

export function StyleAdvisor() {
  const [plans, setPlans] = useState<{ open: boolean; reason?: string }>({ open: false })
  return (
    <div className="mx-auto w-full max-w-6xl">
      <StyleEditor onPlans={(reason) => setPlans({ open: true, reason })} />
      <StylePlans open={plans.open} reason={plans.reason} onOpenChange={(open) => setPlans((p) => ({ ...p, open }))} onFree={() => setPlans({ open: false })} />
    </div>
  )
}
