"use client"

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import { Box, Check, Crown, ExternalLink, Eye, Footprints, Glasses, ImageUp, Layers, Scissors, Shirt, ShoppingBag, Smile, WandSparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard, ProductCardBadge, ProductCardContent, ProductCardHeader, ProductCardImage, ProductCardSubtitle, ProductCardTitle } from "@/components/ui/product-card"
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader"
import { glassOpen } from "@/lib/surfaces"
import { track } from "@/lib/analytics"
import { SHAPE_INFO, type ShapeResult } from "@/lib/style/face-shape"
import { ITEMS, STYLES, type Hairline, type Style } from "@/lib/style/catalog"
import { DEFAULT_OUTFIT, HAIR_COLORS, SKIN_TONES, headFor, type Outfit, type Source } from "@/lib/style/avatar"
import { PLANS, PRO_FEATURES, type PlanId } from "@/lib/style/plans"
import { StyleAvatar } from "@/components/style-avatar"
import { PricingSection } from "@/components/ui/pricing-4"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { cards, tabsFor, type Card, type Look, type TabId } from "@/lib/style/editor"
import { fitNotes, grooming, type Answers, type Link } from "@/lib/style/recommend"

const ICON: Record<TabId, typeof Scissors> = { hair: Scissors, brows: Eye, beard: Smile, glasses: Glasses, top: Shirt, outer: Layers, bottom: Shirt, shoes: Footprints }
const PHASES = [
  { at: 0, label: "Sending your photo" },
  { at: 20, label: "Trying on your look" },
  { at: 70, label: "Finishing details" },
]
const select = "min-h-9 rounded-lg border border-white/10 bg-black/35 px-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"

function Links({ links, where }: { links: Link[]; where: string }) {
  if (!links.length) return null
  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((l) => (
        <li key={l.label}>
          <a href={l.href} target="_blank" rel="sponsored nofollow noopener" onClick={() => track("style_product_click", { product: l.label, where })}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-black/35 px-3 text-sm font-semibold text-(--ollie-cyan) hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)">
            {l.label}<ExternalLink size={13} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  )
}

// Downscale a photo to at most `max` px on its long side, as a JPEG data URL.
async function shrink(file: File, max = 1280): Promise<string> {
  const img = await createImageBitmap(file)
  const s = Math.min(1, max / Math.max(img.width, img.height))
  const c = document.createElement("canvas")
  c.width = img.width * s
  c.height = img.height * s
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL("image/jpeg", 0.9)
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}

// The look -> what the 3D model wears. Outerwear covers the top (the model has one torso piece).
function outfitFor(look: Look, skin?: string, hair?: string): Outfit {
  const pick = (id?: string) => (id ? ITEMS.find((i) => i.id === id) : undefined)
  const torso = pick(look.outer) ?? pick(look.top), legs = pick(look.bottom), feet = pick(look.shoes)
  return {
    head: headFor(look.hair),
    body: (torso?.part as Source) ?? DEFAULT_OUTFIT.body,
    legs: (legs?.part as Source) ?? DEFAULT_OUTFIT.legs,
    feet: (feet?.part as Source) ?? DEFAULT_OUTFIT.feet,
    colors: { body: torso?.color, legs: legs?.color, feet: feet?.color ?? (feet ? undefined : DEFAULT_OUTFIT.colors.feet), skin, hair },
  }
}

export function StyleEditor({ photo, shape, answers, onRescan, onRetake }: {
  photo: string
  shape: ShapeResult
  answers: Answers
  onRescan: () => void
  onRetake: () => void
}) {
  const [base, setBase] = useState(photo)
  const [hairline, setHairline] = useState<Hairline | "">("")
  const [style, setStyle] = useState<Style | "">("")
  const [budget, setBudget] = useState<1 | 2 | 3 | undefined>()
  const a: Answers = { ...answers, hairline: hairline || undefined, budget }
  const tabs = tabsFor(a)
  const all = useMemo(() => Object.fromEntries(tabs.map((t) => [t.id, cards(t.id, a, shape, style ? [style] : [])])) as Record<TabId, Card[]>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hairline, style, budget, shape, answers])
  const [look, setLook] = useState<Look>(() => ({ hair: cards("hair", answers, shape)[0]?.id }))
  const [renders, setRenders] = useState<{ src: string; look: Look }[]>([])
  const [shown, setShown] = useState<string | null>(null) // null = the original photo
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const summary = useRef<HTMLElement>(null)
  const pricing = useRef<HTMLElement>(null)
  const { user, openModal } = useAuth()
  const [pro, setPro] = useState(false)
  const [view, setView] = useState<"3d" | "photo">("3d")
  const [skin, setSkin] = useState<string>()
  const [hairColor, setHairColor] = useState<string>()
  const [buying, setBuying] = useState<PlanId | null>(null)
  const outfit = useMemo(() => outfitFor(look, skin, hairColor), [look, skin, hairColor])
  const thanks = typeof window !== "undefined" && new URLSearchParams(location.search).get("pro") === "thanks"

  useEffect(() => {
    authHeaders().then((h) => fetch("/api/pro", { headers: h })).then((r) => r.json()).then((d) => setPro(!!d.pro)).catch(() => {})
  }, [user])

  const showPlans = () => pricing.current?.scrollIntoView({ behavior: "smooth" })

  async function buy(plan: PlanId) {
    if (!user) return openModal(() => buy(plan), "signup")
    setBuying(plan)
    track("pro_checkout", { plan })
    try {
      const res = await fetch("/api/pro", { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: JSON.stringify({ plan }) })
      const d = await res.json().catch(() => ({}))
      if (d.url) location.href = d.url
      else setError(d.error || "Checkout failed. Please try again.")
    } finally {
      setBuying(null)
    }
  }

  const picked = tabs.flatMap((t) => {
    const c = look[t.id] ? all[t.id]?.find((x) => x.id === look[t.id]) : undefined
    return c ? [{ tab: t, card: c }] : []
  })
  const toggle = (tab: TabId, id: string) => setLook((l) => ({ ...l, [tab]: l[tab] === id ? undefined : id }))

  async function render() {
    setError(null)
    setBusy(true)
    track("style_render", { picks: picked.length })
    try {
      const res = await fetch("/api/style-render", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ image: base, look, texture: answers.texture, consent }),
      })
      const d = await res.json().catch(() => ({}))
      if (d.code === "signin") return openModal(undefined, "signup")
      if (d.code === "pro_required") return showPlans()
      if (!res.ok || !d.image) throw new Error(d.error || "The preview failed. Please try again.")
      setRenders((r) => [...r, { src: d.image, look }])
      setShown(d.image)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const f = e.currentTarget.files?.[0]
    if (!f) return
    setBase(await shrink(f))
    setShown(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        {/* ── preview: free 3D try-on, or the AI try-on on their own photo (Pro) ── */}
        <section className={`${glassOpen} flex flex-col gap-4 p-5 md:p-6`} aria-label="Preview" aria-busy={busy}>
          <Tabs value={view} onValueChange={(v) => setView(v as "3d" | "photo")} className="flex flex-col gap-4">
            <TabsList className="grid h-auto w-full grid-cols-2">
              <TabsTrigger value="3d" className="gap-1.5"><Box size={14} aria-hidden="true" />3D try-on</TabsTrigger>
              <TabsTrigger value="photo" className="gap-1.5"><Crown size={14} aria-hidden="true" />On your photo{!pro && " · Pro"}</TabsTrigger>
            </TabsList>

            <TabsContent value="3d" className="flex flex-col gap-3">
              <StyleAvatar outfit={outfit} className="h-[min(36rem,62svh)] w-full rounded-2xl bg-black/35" />
              <div className="grid grid-cols-2 gap-2">
                <select aria-label="Skin tone" value={skin ?? ""} onChange={(e) => setSkin(e.currentTarget.value || undefined)} className={select}>
                  <option value="">Skin tone</option>
                  {SKIN_TONES.map((t) => <option key={t.hex} value={t.hex}>{t.label}</option>)}
                </select>
                <select aria-label="Hair colour" value={hairColor ?? ""} onChange={(e) => setHairColor(e.currentTarget.value || undefined)} className={select}>
                  <option value="">Hair colour</option>
                  {HAIR_COLORS.map((c) => <option key={c.hex} value={c.hex}>{c.label}</option>)}
                </select>
              </div>
              <p className="text-xs text-white/50">
                Drag to turn the model around. It wears each product&apos;s real colour and cut type; see the exact item on your own photo with Pro.
                {answers.gender === "female" && " A women's 3D model is on the way."}
              </p>
              {!pro && (
                <Button variant="brand" size="cta" onClick={() => { setView("photo"); showPlans() }} className="gap-2">
                  <WandSparkles size={16} aria-hidden="true" />See it on your own photo
                </Button>
              )}
            </TabsContent>

            <TabsContent value="photo" className="flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-2xl bg-black/35">
                {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
                <img src={shown ?? base} alt={shown ? "You with the new look" : "Your photo"} className="mx-auto max-h-[min(36rem,62svh)] w-full object-contain" />
                {busy && (
                  <div className="absolute inset-0 flex items-end bg-black/60 p-5">
                    <ProgressiveFluxLoader phases={PHASES} duration={18} loop={false} className="w-full gap-3 [--flux-from:var(--ollie-cyan)] [--flux-to:var(--ollie-cyan)]" />
                  </div>
                )}
              </div>

              {renders.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Your previews">
                  {[{ src: base, look: {} as Look }, ...renders].map((r, i) => {
                    const active = (i === 0 ? null : r.src) === shown
                    return (
                      <button key={i} onClick={() => setShown(i === 0 ? null : r.src)} aria-pressed={active}
                        className={`relative size-16 shrink-0 overflow-hidden rounded-xl border-2 ${active ? "border-(--ollie-cyan)" : "border-transparent"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)`}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
                        <img src={r.src} alt={i === 0 ? "Original photo" : `Preview ${i}`} className="size-full object-cover" />
                      </button>
                    )
                  })}
                </div>
              )}

              {pro ? (
                <>
                  <label className="flex items-start gap-2.5 text-sm text-white/70">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.currentTarget.checked)} className="mt-0.5 size-4 accent-(--ollie-cyan)" />
                    <span>Send my photo to Google&apos;s Gemini to create the preview. Ollie doesn&apos;t keep it, and Google is asked not to store it.</span>
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="brand" size="cta" onClick={render} disabled={busy || !consent || picked.length === 0} className="gap-2 sm:flex-1">
                      <WandSparkles size={16} aria-hidden="true" />Try this look
                    </Button>
                    <Button variant="brandOutline" size="cta" asChild className="gap-2">
                      <label className="cursor-pointer">
                        <ImageUp size={16} aria-hidden="true" />Use a full-body photo
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="sr-only" />
                      </label>
                    </Button>
                  </div>
                  <p className="text-xs text-white/50">Tip: your scan photo shows hair, face and tops. Add a full-body photo to see trousers and shoes.</p>
                </>
              ) : (
                <div className="flex flex-col gap-3 rounded-2xl bg-black/35 p-4">
                  <p className="text-sm leading-relaxed text-white/70">
                    See the exact haircut, beard and real clothes on <span className="font-semibold text-white">your own face and body</span>, made by AI from the brands&apos; own product photos. Part of Ollie Pro.
                  </p>
                  <Button variant="brand" size="cta" onClick={showPlans} className="gap-2"><Crown size={16} aria-hidden="true" />See Pro plans</Button>
                </div>
              )}
              {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            </TabsContent>
          </Tabs>
        </section>

        {/* ── catalogue ── */}
        <section className={`${glassOpen} flex min-h-0 flex-col gap-4 p-5 md:p-6`} aria-label="Pick your look">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white">Style &amp; shop</h2>
            <select aria-label="Budget" value={budget ?? ""} onChange={(e) => setBudget(e.currentTarget.value ? (Number(e.currentTarget.value) as 1 | 2 | 3) : undefined)} className={select}>
              <option value="">Any budget</option>
              <option value="1">Budget-friendly</option>
              <option value="2">Mid-range</option>
              <option value="3">Premium</option>
            </select>
          </div>
          <Tabs defaultValue="hair" className="flex min-h-0 flex-col">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              {tabs.map((t) => <TabsTrigger key={t.id} value={t.id}>{t.label}{look[t.id] && <Check size={12} className="ml-1" aria-label="picked" />}</TabsTrigger>)}
            </TabsList>
            {tabs.map((t) => {
              const Icon = ICON[t.id]
              const clothes = ["top", "outer", "bottom", "shoes"].includes(t.id)
              return (
                <TabsContent key={t.id} value={t.id} className="flex flex-col gap-3">
                  {t.id === "hair" && (
                    <select aria-label="Your hairline" value={hairline} onChange={(e) => setHairline(e.currentTarget.value as Hairline | "")} className={select}>
                      <option value="">Hairline: not set</option>
                      <option value="full">Hairline: full</option>
                      <option value="slight">Hairline: slightly receding</option>
                      <option value="receding">Hairline: receding</option>
                      <option value="thinning">Hairline: thinning on top</option>
                      <option value="bald">Hairline: bald or nearly</option>
                    </select>
                  )}
                  {t.id === "beard" && <p className="text-sm text-white/60">Only if you want facial hair. Leave it unpicked and it stays as it is.</p>}
                  {clothes && (
                    <select aria-label="Style" value={style} onChange={(e) => setStyle(e.currentTarget.value as Style | "")} className={select}>
                      <option value="">All styles</option>
                      {(Object.keys(STYLES) as Style[]).map((s) => <option key={s} value={s}>{STYLES[s].label}</option>)}
                    </select>
                  )}
                  <div className="grid max-h-[min(34rem,60svh)] grid-cols-2 gap-3 overflow-y-auto pr-1">
                    {all[t.id]?.map((c) => {
                      const on = look[t.id] === c.id
                      return (
                        <button key={c.id} type="button" onClick={() => toggle(t.id, c.id)} aria-pressed={on}
                          className={`rounded-xl text-left ring-2 ${on ? "ring-(--ollie-cyan)" : "ring-transparent"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)`}>
                          <ProductCard className="max-w-none" size="sm">
                            <ProductCardImage className="flex aspect-[4/3] items-center justify-center">
                              <Icon size={28} className={on ? "text-(--ollie-cyan)" : "text-white/40"} aria-hidden="true" />
                              {(on || c.best) && <ProductCardBadge isActive={on}>{on ? "Picked" : "Best for you"}</ProductCardBadge>}
                            </ProductCardImage>
                            <ProductCardContent>
                              <ProductCardHeader>
                                <ProductCardTitle>{c.name}</ProductCardTitle>
                                <ProductCardSubtitle className="line-clamp-2">{c.sub}</ProductCardSubtitle>
                              </ProductCardHeader>
                            </ProductCardContent>
                          </ProductCard>
                        </button>
                      )
                    })}
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
          <Button variant="brand" size="cta" className="mt-auto gap-2 rounded-full" onClick={() => summary.current?.scrollIntoView({ behavior: "smooth" })}>
            <ShoppingBag size={16} aria-hidden="true" />{picked.length} pick{picked.length === 1 ? "" : "s"} · Shop the look
          </Button>
        </section>
      </div>

      {/* ── your look: details + shop links ── */}
      <section ref={summary} className={`${glassOpen} flex flex-col gap-5 p-5 md:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black tracking-tight text-white">Your look</h2>
          <div className="flex gap-2">
            <Button variant="brandOutline" size="sm" onClick={onRescan}>Rescan</Button>
            <Button variant="brandOutline" size="sm" onClick={onRetake}>Change answers</Button>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-white/70">Face shape: <span className="font-semibold capitalize text-white">{shape.shape}</span>. {SHAPE_INFO[shape.shape]}</p>
        {picked.length === 0 && <p className="text-sm text-white/60">Pick something from the tabs above to see it here.</p>}
        {picked.map(({ tab, card }) => (
          <div key={tab.id} className="flex flex-col gap-2 rounded-2xl bg-black/35 p-4">
            <h3 className="text-lg font-bold text-white"><span className="mr-2 text-sm font-semibold text-(--ollie-cyan)">{tab.label}</span>{card.name}</h3>
            {card.why && <p className="text-sm text-white/60">{card.why}</p>}
            {card.cut && (
              <>
                <p className="text-sm leading-relaxed text-white/70"><span className="font-semibold text-white">Ask for: </span>{card.cut.ask}</p>
                <ol className="list-decimal pl-5 text-sm leading-relaxed text-white/70">{card.cut.styling.map((s) => <li key={s}>{s}</li>)}</ol>
                <p className="text-xs text-white/50">Trim every {card.cut.weeks} week{card.cut.weeks > 1 ? "s" : ""}</p>
              </>
            )}
            <Links links={card.links} where={`${tab.id}:${card.id}`} />
          </div>
        ))}
        {fitNotes(a).length > 0 && (
          <ul className="list-disc pl-5 text-sm leading-relaxed text-white/70">{fitNotes(a).map((n) => <li key={n}>{n}</li>)}</ul>
        )}
        {grooming(a).map((g) => (
          <div key={g.title} className="flex flex-col gap-2">
            <h3 className="text-base font-bold text-white">{g.title}</h3>
            <p className="text-sm leading-relaxed text-white/70">{g.text}</p>
            <Links links={g.products} where={`grooming:${g.title}`} />
          </div>
        ))}
        <p className="text-xs text-white/50">Ollie earns a commission from some links. As an Amazon Associate, Ollie earns from qualifying purchases.</p>
      </section>

      {/* ── Ollie Pro ── */}
      <section ref={pricing} className={`${glassOpen} flex flex-col gap-2 p-2 md:p-4`} aria-label="Ollie Pro plans">
        {(pro || thanks) && (
          <p role="status" className="mx-4 mt-3 rounded-xl border border-(--ollie-cyan)/30 bg-(--ollie-cyan)/10 p-3 text-sm text-white">
            {pro ? "You have Ollie Pro. Open the \u201cOn your photo\u201d tab to try any look on yourself." : "Thanks! Your payment went through. Pro unlocks on your account within a minute."}
          </p>
        )}
        <PricingSection
          title="Ollie Pro"
          subtitle="The 3D try-on stays free. Pro puts every look on your own photo, plus Ollie's celebrity lookalike finder and face compare."
          plans={PLANS.map((p) => ({
            name: p.name,
            info: p.note,
            price: p.price,
            period: p.period,
            highlighted: p.highlighted,
            badge: p.id === "yearly" ? "Save 52%" : p.id === "lifetime" ? "Best value" : undefined,
            features: PRO_FEATURES,
            btn: { text: pro ? "You have Pro" : buying === p.id ? "Opening checkout\u2026" : `Get ${p.name}`, onClick: () => buy(p.id), disabled: pro || buying !== null },
          }))}
        />
      </section>
    </div>
  )
}
