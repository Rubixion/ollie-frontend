"use client"
// 21st.dev "Modal Pricing" (kokonutd/modal-pricing), adapted: Free vs Ollie Pro, with the Pro billing
// option (monthly / yearly / lifetime) picked inside the Pro card. Opens from every Pro feature, in context.
// Sells the outcome (headline + a before/after preview), prices in the visitor's currency, yearly shown per month.
import { useEffect, useState } from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { Check, Crown, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { track } from "@/lib/analytics"
import { FREE_FEATURES, PLANS, PRO_FEATURES, PRO_PROMISE, PRICES, money, priceLines, type Currency, type PlanId } from "@/lib/style/plans"

export async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}

/** Pro status of the signed-in user (null while checking) and the currency to show prices in. */
export function useProInfo() {
  const { user } = useAuth()
  const [info, setInfo] = useState<{ pro: boolean | null; currency: Currency }>({ pro: null, currency: "USD" })
  useEffect(() => {
    authHeaders().then((h) => fetch("/api/pro", { headers: h })).then((r) => r.json())
      .then((d) => setInfo({ pro: !!d.pro, currency: d.currency in PRICES ? d.currency : "USD" }))
      .catch(() => setInfo({ pro: false, currency: "USD" }))
  }, [user])
  return info
}
export const usePro = () => useProInfo().pro

export function StylePlans({ open, onOpenChange, onFree, reason }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFree: () => void
  reason?: string // why it opened, e.g. "AI try-on on your own photo is part of Pro"
}) {
  const { user, openModal } = useAuth()
  const [plan, setPlan] = useState<PlanId>("yearly")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { currency } = useProInfo()
  const total = PRICES[currency][plan]

  useEffect(() => { if (open) track("pro_paywall_view", { reason: reason ?? "start" }) }, [open, reason])

  async function upgrade() {
    if (!user) return openModal(upgrade, "signup")
    setBusy(true)
    setError(null)
    track("pro_checkout", { plan })
    try {
      const res = await fetch("/api/pro", { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: JSON.stringify({ plan }) })
      const d = await res.json().catch(() => ({}))
      if (d.url) location.href = d.url
      else setError(d.error || "Checkout failed. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="h-5 w-5 text-(--ollie-cyan)" aria-hidden="true" />
            {PRO_PROMISE}
          </DialogTitle>
          <DialogDescription>{reason ?? "See the haircut and the outfit on your own photo first, made from the brands' real product photos."}</DialogDescription>
        </DialogHeader>

        {/* free preview: what Pro makes, on a fictional sample person */}
        <figure className="grid grid-cols-2 gap-2">
          {[["before", "Before"], ["after", "With Pro"]].map(([f, label]) => (
            <div key={f} className="relative overflow-hidden rounded-xl bg-black/35">
              {/* eslint-disable-next-line @next/next/no-img-element -- static sample */}
              <img src={`/style/preview/${f}.jpg`} alt={`${label}: a sample person`} className="aspect-square w-full object-cover" />
              <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold ${f === "after" ? "bg-(--ollie-cyan) text-black" : "bg-black/60 text-white"}`}>{label}</span>
            </div>
          ))}
          <figcaption className="col-span-2 text-center text-xs text-white/50">Sample: textured crop and a Levi&apos;s Trucker, tried on before buying.</figcaption>
        </figure>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-xl border-2 border-white/10 p-4">
            <h3 className="text-sm font-semibold">Free</h3>
            <p className="text-sm text-white/60">Try it on a model</p>
            <p className="mt-3 text-2xl font-bold">{money(0, currency)}</p>
            <ul className="mt-4 space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start text-sm text-white/70"><Check className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />{f}</li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative flex flex-col rounded-xl border-2 border-(--ollie-cyan) bg-(--ollie-cyan)/[0.06] p-4">
            <span className="absolute -top-3 right-4 rounded-full bg-(--ollie-cyan) px-2.5 py-0.5 text-xs font-bold text-black">Most popular</span>
            <h3 className="flex items-center gap-1.5 text-sm font-semibold"><Crown className="h-4 w-4 text-(--ollie-cyan)" aria-hidden="true" />Ollie Pro</h3>
            <p className="text-sm text-white/60">Try it on yourself</p>
            <RadioGroupPrimitive.Root value={plan} onValueChange={(v) => setPlan(v as PlanId)} className="mt-3 grid gap-2" aria-label="Billing">
              {PLANS.map((p) => { const l = priceLines(p.id, currency); return (
                <label key={p.id} className={`relative flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition-colors ${plan === p.id ? "border-(--ollie-cyan) bg-black/40" : "border-white/10 hover:border-white/25"}`}>
                  <RadioGroupPrimitive.Item value={p.id} className="sr-only" />
                  <span className="text-sm">
                    <span className="font-semibold">{p.name}</span>
                    {p.highlighted && <span className="ml-1.5 rounded-full bg-(--ollie-cyan)/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-(--ollie-cyan)">Best value</span>}
                    <span className="block text-xs text-white/50">{l.note}</span>
                  </span>
                  <span className="text-right">
                    <span className="text-lg font-bold">{l.big}</span>
                    <span className="ml-1 text-xs text-white/50">{l.per}</span>
                  </span>
                  {plan === p.id && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-(--ollie-cyan)">
                      <Check className="h-3 w-3 text-black" aria-hidden="true" />
                    </span>
                  )}
                </label>
              )})}
            </RadioGroupPrimitive.Root>
            <ul className="mt-4 space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start text-sm text-white/80"><Check className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-(--ollie-cyan)" aria-hidden="true" />{f}</li>
              ))}
            </ul>
          </div>
        </div>

        {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button variant="brand" size="cta" onClick={upgrade} disabled={busy} className="w-full gap-2">
            <Crown className="h-4 w-4" aria-hidden="true" />
            {busy ? "Opening checkout…" : `Upgrade to Pro · ${money(total, currency)}${plan === "lifetime" ? " once" : plan === "yearly" ? "/year" : "/month"}`}
          </Button>
          <Button variant="ghost" onClick={() => { track("pro_paywall_free"); onFree() }} className="w-full text-white/60 hover:bg-white/[0.05] hover:text-white">
            Continue with free
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
