"use client"

// /ai-stylist opens straight on the editor with a dressed model; no questions first. The face scan and the Pro popup
// come up in context, from inside the editor.
import { useState } from "react"
import { ScanFace } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StyleEditor } from "@/components/style-editor"
import { track } from "@/lib/analytics"
import { StylePlans } from "@/components/style-plans"

export function StyleAdvisor() {
  const [plans, setPlans] = useState<{ open: boolean; reason?: string }>({ open: false })
  const [scan, setScan] = useState(0) // bumped to start the face scan from outside the editor
  const startScan = (where: string) => { setScan((n) => n + 1); track("style_scan_open", { where }) }
  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* the first action: the face scan is the free "aha" that leads to haircuts, the share card and Pro */}
      <div className="mb-5 flex justify-center">
        <Button variant="brand" size="cta" onClick={() => startScan("hero")} className="gap-2 rounded-full px-6">
          <ScanFace size={16} aria-hidden="true" />Scan my face · free, 10 seconds
        </Button>
      </div>
      <StyleEditor onPlans={(reason) => setPlans({ open: true, reason })} scan={scan} onScan={startScan} />
      <StylePlans open={plans.open} reason={plans.reason} onOpenChange={(open) => setPlans((p) => ({ ...p, open }))} onFree={() => setPlans({ open: false })} />
    </div>
  )
}
