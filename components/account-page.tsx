"use client"

// /account: the profile page behind the account icon. Layout from 21st.dev cnippet-dev/v-tabs-13 (vertical settings tabs),
// danger zone from cnippet-dev/v-form-12 (type-to-confirm delete), switch from shadcn/switch, on the Ollie look.
import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { Bookmark, Crown, Download, LogOut, Mail, Shield, TriangleAlert, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { authHeaders, usePro } from "@/components/style-plans"
import { OutfitThumb } from "@/components/outfit-thumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { glassOpen } from "@/lib/surfaces"
import { track } from "@/lib/analytics"
import { deleteOutfit, listOutfits, type SavedOutfit } from "@/lib/style/saved"

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "outfits", label: "Saved outfits", icon: Bookmark },
  { id: "email", label: "Email", icon: Mail },
  { id: "security", label: "Security", icon: Shield },
  { id: "data", label: "Your data", icon: TriangleAlert },
] as const
const CONFIRM = "delete my account"
const field = "border-white/10 bg-black/35 text-white h-11"

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="mt-0.5 text-sm text-white/60">{sub}</p>
      </div>
      <div className="h-px w-full bg-white/10" />
      {children}
    </div>
  )
}
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1 rounded-xl bg-black/35 px-4 py-3">
    <span className="text-xs font-medium text-white/50">{label}</span>
    <span className="text-sm text-white">{children}</span>
  </div>
)

export function AccountPage() {
  const { user, loading, signOut, openModal } = useAuth()
  const pro = usePro()
  const [tab, setTab] = useState("profile")
  useEffect(() => {
    const t = new URLSearchParams(location.search).get("tab")
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of ?tab= after hydration
    if (t && TABS.some((x) => x.id === t)) setTab(t)
    track("account_view")
  }, [])

  // ── saved outfits ──
  const [outfits, setOutfits] = useState<SavedOutfit[]>()
  useEffect(() => { if (user) listOutfits().then(setOutfits).catch(() => setOutfits([])) }, [user])

  // ── email preference (user_consents, through /api/consent) ──
  const [emailOn, setEmailOn] = useState<boolean>()
  const [emailMsg, setEmailMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!user) return
    authHeaders().then((h) => fetch("/api/consent", { headers: h })).then((r) => r.json()).then((d) => setEmailOn(!!d.emailOptIn)).catch(() => setEmailOn(false))
  }, [user])
  async function setEmail(on: boolean) {
    setEmailOn(on)
    const res = await fetch("/api/consent", { method: "PATCH", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: JSON.stringify({ emailOptIn: on }) })
    if (!res.ok) { setEmailOn(!on); setEmailMsg((await res.json().catch(() => ({}))).error ?? "Couldn't save. Please try again."); return }
    setEmailMsg(on ? "You're on the list." : "You won't get emails from us any more.")
    track("account_email_pref", { on })
  }

  // ── security ──
  const [pw, setPw] = useState({ a: "", b: "" })
  const [pwMsg, setPwMsg] = useState<string | null>(null)
  async function changePassword(e: FormEvent) {
    e.preventDefault()
    if (pw.a.length < 8) return setPwMsg("Use at least 8 characters.")
    if (pw.a !== pw.b) return setPwMsg("The two passwords don't match.")
    const { error } = await supabase.auth.updateUser({ password: pw.a })
    setPwMsg(error ? error.message : "Password updated.")
    if (!error) { setPw({ a: "", b: "" }); track("account_password_change") }
  }
  const [newEmail, setNewEmail] = useState("")
  const [mailMsg, setMailMsg] = useState<string | null>(null)
  async function changeEmail(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() }, { emailRedirectTo: `${location.origin}/account` })
    setMailMsg(error ? error.message : "Check both inboxes: confirm the change from the links we sent.")
    if (!error) track("account_email_change")
  }

  // ── data ──
  async function download() {
    const consent = await authHeaders().then((h) => fetch("/api/consent", { headers: h })).then((r) => r.json()).catch(() => null)
    const data = {
      exported_at: new Date().toISOString(),
      account: { id: user!.id, email: user!.email, created_at: user!.created_at, sign_in_methods: user!.app_metadata?.providers ?? [] },
      email_preferences: consent,
      saved_outfits: outfits ?? [],
    }
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }))
    a.download = "ollie-account-data.json"
    a.click()
    URL.revokeObjectURL(a.href)
    track("account_data_download")
  }
  const [confirm, setConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [delMsg, setDelMsg] = useState<string | null>(null)
  async function deleteAccount(e: FormEvent) {
    e.preventDefault()
    if (confirm.toLowerCase() !== CONFIRM) return
    setDeleting(true)
    const res = await fetch("/api/account", { method: "DELETE", headers: await authHeaders() })
    if (!res.ok) { setDeleting(false); setDelMsg((await res.json().catch(() => ({}))).error ?? "Couldn't delete the account."); return }
    track("account_delete")
    await signOut().catch(() => {})
    location.href = "/?account=deleted"
  }

  if (loading) return <Skeleton className="h-96 w-full rounded-3xl bg-white/[0.06]" />
  if (!user) {
    return (
      <div className={`${glassOpen} mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center`}>
        <User size={28} className="text-(--ollie-cyan)" aria-hidden="true" />
        <h1 className="text-2xl font-black text-white">Your account</h1>
        <p className="text-sm text-white/70">Sign in to see your saved outfits and manage your account.</p>
        <Button variant="brand" size="cta" onClick={() => openModal(undefined, "signin")}>Sign in</Button>
      </div>
    )
  }

  const methods: string[] = user.app_metadata?.providers ?? [user.app_metadata?.provider ?? "email"]
  const hasPassword = methods.includes("email")
  return (
    <div className={`${glassOpen} flex flex-col gap-6 p-5 md:p-8`}>
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Your account</h1>
        <p className="mt-1 truncate text-sm text-white/60">{user.email}</p>
      </div>
      <Tabs value={tab} onValueChange={setTab} orientation="vertical" className="flex flex-col gap-6 md:flex-row">
        <TabsList className="flex h-auto w-full shrink-0 flex-row flex-wrap justify-start gap-1 md:w-52 md:flex-col md:items-stretch">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="justify-start gap-2.5"><t.icon size={15} aria-hidden="true" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="min-w-0 flex-1">
          <TabsContent value="profile" className="mt-0">
            <Section title="Profile" sub="Your account and plan.">
              <div className="grid gap-3 sm:grid-cols-2">
                <Row label="Email">{user.email}</Row>
                <Row label="Member since">{new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</Row>
                <Row label="Signs in with">{methods.map((m) => (m === "email" ? "Email and password" : m[0].toUpperCase() + m.slice(1))).join(", ")}</Row>
                <Row label="Plan">{pro === null ? "…" : pro ? "Ollie Pro" : "Free"}</Row>
              </div>
              {pro === false && (
                <Button asChild variant="brand" size="cta" className="gap-2 self-start">
                  <Link href="/ai-stylist?plans=1" onClick={() => track("account_get_pro")}><Crown size={16} aria-hidden="true" />Get Ollie Pro</Link>
                </Button>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="brandOutline" size="cta" className="gap-2" onClick={() => signOut().then(() => { location.href = "/" })}><LogOut size={16} aria-hidden="true" />Sign out</Button>
                <Button variant="brandOutline" size="cta" className="gap-2" onClick={() => supabase.auth.signOut({ scope: "global" }).then(() => { location.href = "/" })}>Sign out on all devices</Button>
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="outfits" className="mt-0">
            <Section title="Saved outfits" sub="Outfits you saved in the AI Stylist. Open one to keep editing it.">
              {!outfits ? <Skeleton className="h-48 rounded-2xl bg-white/[0.06]" /> : !outfits.length ? (
                <div className="flex flex-col items-start gap-3 rounded-2xl bg-black/35 p-5">
                  <p className="text-sm text-white/70">No saved outfits yet. Put one together in the AI Stylist and tap Save this outfit.</p>
                  <Button asChild variant="brand" size="cta"><Link href="/ai-stylist">Open the AI Stylist</Link></Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {outfits.map((o) => (
                    <div key={o.id} className="flex flex-col gap-2 rounded-xl bg-black/35 p-2">
                      <Link href={`/ai-stylist?saved=${o.id}`} className="flex flex-col gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-(--ollie-cyan)">
                        <OutfitThumb look={o.look} />
                        <span className="px-1 text-sm font-semibold text-white">{o.name}</span>
                      </Link>
                      <button type="button" className="min-h-8 px-1 text-left text-xs text-white/50 hover:text-red-300"
                        onClick={() => deleteOutfit(o.id).then(() => setOutfits((l) => l?.filter((x) => x.id !== o.id))).catch(() => {})}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </TabsContent>

          <TabsContent value="email" className="mt-0">
            <Section title="Email" sub="What we send you. Account emails (password resets, sign-in links) always go out.">
              <label className="flex items-center justify-between gap-4 rounded-xl bg-black/35 px-4 py-3">
                <span className="text-sm text-white">Style tips, new features and offers from the Ollie team</span>
                <Switch checked={!!emailOn} disabled={emailOn === undefined} onCheckedChange={setEmail} aria-label="Marketing emails" />
              </label>
              {emailMsg && <p role="status" className="text-sm text-white/70">{emailMsg}</p>}
            </Section>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <Section title="Security" sub="Your password and sign-in email.">
              <form onSubmit={changePassword} className="flex flex-col gap-3 rounded-2xl bg-black/35 p-4">
                <p className="text-sm font-semibold text-white">{hasPassword ? "Change password" : "Set a password"}</p>
                {!hasPassword && <p className="text-xs text-white/60">You sign in with Google. A password lets you sign in with your email too.</p>}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5"><Label htmlFor="pw-a" className="text-white/70">New password</Label>
                    <Input id="pw-a" type="password" autoComplete="new-password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} className={field} /></div>
                  <div className="flex flex-col gap-1.5"><Label htmlFor="pw-b" className="text-white/70">Repeat it</Label>
                    <Input id="pw-b" type="password" autoComplete="new-password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} className={field} /></div>
                </div>
                <Button type="submit" variant="brand" size="cta" className="self-start" disabled={!pw.a}>Save password</Button>
                {pwMsg && <p role="status" className="text-sm text-white/70">{pwMsg}</p>}
              </form>
              <form onSubmit={changeEmail} className="flex flex-col gap-3 rounded-2xl bg-black/35 p-4">
                <p className="text-sm font-semibold text-white">Change email</p>
                <div className="flex flex-col gap-1.5"><Label htmlFor="new-email" className="text-white/70">New email</Label>
                  <Input id="new-email" type="email" autoComplete="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={field} /></div>
                <Button type="submit" variant="brandOutline" size="cta" className="self-start" disabled={!newEmail.includes("@")}>Send confirmation</Button>
                {mailMsg && <p role="status" className="text-sm text-white/70">{mailMsg}</p>}
              </form>
            </Section>
          </TabsContent>

          <TabsContent value="data" className="mt-0">
            <Section title="Your data" sub="Download everything we hold on your account, or delete it.">
              <Button variant="brandOutline" size="cta" className="gap-2 self-start" onClick={download}><Download size={16} aria-hidden="true" />Download my data</Button>
              <form onSubmit={deleteAccount} className="flex flex-col gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
                <div className="flex items-start gap-3">
                  <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-400" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-white">Delete your account</p>
                    <p className="text-xs text-white/60">This is permanent. Your account, saved outfits and email preferences are deleted and can&apos;t be recovered.{pro ? " Cancel your Pro subscription first so you aren't charged again." : ""}</p>
                  </div>
                </div>
                <Label htmlFor="confirm-delete" className="text-sm text-white/70">Type <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">{CONFIRM}</code> to confirm</Label>
                <Input id="confirm-delete" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={CONFIRM} autoComplete="off" className={field} />
                <Button type="submit" variant="destructive" size="cta" disabled={confirm.toLowerCase() !== CONFIRM || deleting}>{deleting ? "Deleting…" : "Permanently delete account"}</Button>
                {delMsg && <p role="alert" className="text-sm text-red-300">{delMsg}</p>}
              </form>
            </Section>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
