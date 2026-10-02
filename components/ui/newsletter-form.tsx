"use client"

// Newsletter form after the shadcn "newsletter-form" block, wired to /api/newsletter (no account needed) and
// styled like Ollie's other cards.
import { useId, useState, type FormEvent } from "react"
import Link from "next/link"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailIcon } from "@/components/ui/email-icon"
import { track } from "@/lib/analytics"
import { NEWSLETTER_CONSENT } from "@/lib/newsletter"
import { cn } from "@/lib/utils"

export default function NewsletterForm({
  defaultEmail = "",
  source = "search",
  title = "Stay updated",
  className,
}: {
  defaultEmail?: string
  source?: "search" | "blog" | "stylist"
  title?: string
  className?: string
}) {
  const id = useId()
  const [email, setEmail] = useState(defaultEmail)
  const [state, setState] = useState<"idle" | "busy" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setState("busy")
    setError(null)
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, consent: true, source }), // submitting under the consent text is the consent
    }).catch(() => null)
    if (res?.ok) {
      track("newsletter_signup", { source })
      return setState("done")
    }
    const msg = res ? ((await res.json().catch(() => null))?.error as string | undefined) : undefined
    setError(res?.status === 400 && msg ? msg : "Couldn't add you. Try again in a moment.")
    setState("idle")
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto rounded-2xl border-white/10 bg-(--ollie-card)/80 text-left text-white shadow-lg shadow-black/40 backdrop-blur-md", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <EmailIcon size={20} className="text-(--ollie-cyan)" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state !== "done" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={id} className="text-white/80">Your email address</Label>
              <Input
                id={id}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-white/15 bg-black/40 text-white placeholder:text-white/35 focus-visible:border-(--ollie-cyan) focus-visible:ring-(--ollie-cyan)/25"
              />
            </div>
            <Button type="submit" variant="brand" size="cta" className="w-full" disabled={state === "busy"}>
              {state === "busy" && <Loader2 size={16} className="me-2 animate-spin" aria-hidden="true" />}
              Join the list
            </Button>
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            <p className="text-xs leading-relaxed text-white/50">
              {NEWSLETTER_CONSENT}{" "}
              <Link href="/privacy" className="underline decoration-white/20 underline-offset-2 hover:text-white/70">Privacy</Link>
            </p>
          </form>
        ) : (
          <p role="status" className="flex items-start gap-2 font-medium text-(--ollie-cyan)">
            <Check size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            You&apos;re in! We&apos;ll email you new features and style tips.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
