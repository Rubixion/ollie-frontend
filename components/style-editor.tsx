"use client"

// The /ai-stylist editor. Opens straight on a dressed model (the "aha": change clothes, see it instantly, free).
// Model tab: gender, body type and look. Clothes tab: pick items yourself, or "Choose for me" by the look you're after.
// Hair & face tab: about the user, not the model. Asks for the face scan only here, after a short explainer
// (in-context permission priming); the result shows their face shape and picks, then offers Pro to see them on you.
// Pro (the popup via onPlans): the AI try-on on your own photo, brow shapes, unlimited Choose for me.
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import { Check, Crown, ExternalLink, Eye, Footprints, Glasses, ImageUp, Layers, Lock, ScanFace, Scissors, Shirt, ShoppingBag, Smile, Sparkles, WandSparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProductCard, ProductCardBadge, ProductCardContent, ProductCardHeader, ProductCardImage, ProductCardSubtitle, ProductCardTitle } from "@/components/ui/product-card"
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { StyleScanner, type ScanResult } from "@/components/style-scanner"
import { useAuth } from "@/components/auth-provider"
import { authHeaders, usePro } from "@/components/style-plans"
import { glassOpen } from "@/lib/surfaces"
import { track } from "@/lib/analytics"
import { SHAPE_INFO, classify, type ShapeResult } from "@/lib/style/face-shape"
import { ITEMS, STYLES, type Hairline, type Slot, type Style, type Texture } from "@/lib/style/catalog"
import { cards, type Card, type Look, type TabId } from "@/lib/style/editor"
import { fitNotes, type Answers, type Link } from "@/lib/style/recommend"
import { BUILDS, LOOKS, body, chooseOutfit, layers, modelPhoto, type Assets, type Build, type Gender, type LookId, type Outfit } from "@/lib/style/model"

const SLOTS: { id: Slot; label: string; icon: typeof Shirt }[] = [
  { id: "top", label: "Tops", icon: Shirt }, { id: "outer", label: "Jackets", icon: Layers },
  { id: "bottom", label: "Bottoms", icon: Shirt }, { id: "shoes", label: "Shoes", icon: Footprints },
]
const FACE: { id: TabId; label: string; icon: typeof Scissors; pro?: boolean }[] = [
  { id: "hair", label: "Hair", icon: Scissors }, { id: "beard", label: "Beard", icon: Smile },
  { id: "glasses", label: "Glasses", icon: Glasses }, { id: "brows", label: "Brows", icon: Eye, pro: true },
]
const PHASES = [
  { at: 0, label: "Sending your photo" },
  { at: 20, label: "Trying on your look" },
  { at: 70, label: "Finishing details" },
]
// product thumbnails: the item's own clothes layer, zoomed to where it sits on the body
const THUMB: Record<Slot, string> = { top: "center 24% / auto 190%", outer: "center 26% / auto 170%", bottom: "center 78% / auto 150%", shoes: "center 96% / auto 520%" }
const FREE_PICKS = 3 // "Choose for me" per day on the free plan
const DEFAULT_OUTFIT: Outfit = { top: "uniqlo-u-tee", bottom: "levis-501", shoes: "converse-chuck-70" }
const select = "min-h-9 rounded-lg border border-white/10 bg-black/35 px-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"
const optionBtn = (on: boolean) => `rounded-xl text-left ring-2 ${on ? "ring-(--ollie-cyan)" : "ring-transparent"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)`

// per-viewer conveniences only (the model they set up, today's free picks); the page works without storage
function stored<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback } catch { return fallback }
}
function store(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }

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

function Option({ card, on, icon: Icon, thumb, onClick }: { card: Card; on: boolean; icon: typeof Shirt; thumb?: { src: string; fit: string }; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={optionBtn(on)}>
      <ProductCard className="max-w-none" size="sm">
        <ProductCardImage className="relative flex aspect-[4/3] items-center justify-center">
          <Icon size={28} className={on ? "text-(--ollie-cyan)" : "text-white/40"} aria-hidden="true" />
          {thumb && <div aria-hidden="true" className="absolute inset-0" style={{ background: `url(${thumb.src}) ${thumb.fit} no-repeat, linear-gradient(#aea296, #bbafa5)` }} />}
          {(on || card.best) && <ProductCardBadge isActive={on}>{on ? "Picked" : "Best for you"}</ProductCardBadge>}
        </ProductCardImage>
        <ProductCardContent>
          <ProductCardHeader>
            <ProductCardTitle>{card.name}</ProductCardTitle>
            <ProductCardSubtitle className="line-clamp-2">{card.sub}</ProductCardSubtitle>
          </ProductCardHeader>
        </ProductCardContent>
      </ProductCard>
    </button>
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

export function StyleEditor({ onPlans }: { onPlans: (reason?: string) => void }) {
  const pro = usePro()
  const { openModal } = useAuth()

  // ── the model ──
  const [gender, setGender] = useState<Gender>("male")
  const [build, setBuild] = useState<Build>("average")
  const [lookId, setLookId] = useState<LookId>("white")
  const [assets, setAssets] = useState<Assets>({ layers: {}, looks: {} })
  const [outfit, setOutfit] = useState<Outfit>(DEFAULT_OUTFIT)
  useEffect(() => { // restore their model, and load which clothes layers exist
    const m = stored<{ gender?: Gender; build?: Build; lookId?: LookId }>("style_model", {})
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from localStorage after hydration */
    if (m.gender) setGender(m.gender)
    if (m.build && BUILDS.some((b) => b.id === m.build)) setBuild(m.build)
    if (m.lookId && LOOKS.some((l) => l.id === m.lookId)) setLookId(m.lookId)
    /* eslint-enable react-hooks/set-state-in-effect */
    fetch("/style/layers/index.json", { cache: "no-cache" }).then((r) => r.json())
      .then((d) => setAssets({ v: d?.v, layers: d?.layers ?? {}, looks: d?.looks ?? {} })).catch(() => {})
  }, [])
  // saved when they change it (not in an effect, which would race the restore above and overwrite it)
  const setModel = (next: { gender?: Gender; build?: Build; lookId?: LookId }) => {
    if (next.gender) setGender(next.gender)
    if (next.build) setBuild(next.build)
    if (next.lookId) setLookId(next.lookId)
    store("style_model", { gender, build, lookId, ...next })
  }
  // only offer bodies and looks that have been generated; fall back to one that has
  const looksFor = (g: Gender, b: Build) => (assets.layers[body(g, b)]?.length ? assets.looks[body(g, b)] ?? [] : []) // needs its clothes too
  const bodyB = looksFor(gender, build).length ? build : BUILDS.find((b) => looksFor(gender, b.id).length)?.id ?? build
  const look = looksFor(gender, bodyB).includes(lookId) ? lookId : (looksFor(gender, bodyB)[0] as LookId | undefined) ?? lookId
  const have = assets.layers[body(gender, bodyB)] ?? []
  const u = (src: string) => (assets.v ? `${src}?v=${assets.v}` : src) // regenerated images never show stale
  const stack = layers(gender, bodyB, outfit, have)
  const setG = (g: Gender) => { setModel({ gender: g }); track("style_model_gender", { g }) }

  // ── clothes ──
  const [clothesMode, setClothesMode] = useState<"pick" | "auto">("pick")
  const [autoStyle, setAutoStyle] = useState<Style>()
  const [autoNotes, setAutoNotes] = useState<string[]>([])
  // the model always wears a top: tapping the picked top again goes back to the plain tee
  const wear = (slot: Slot, id: string) => setOutfit((o) => ({ ...o, [slot]: o[slot] === id ? (slot === "top" ? DEFAULT_OUTFIT.top : undefined) : id }))
  function chooseForMe(style: Style) {
    const today = new Date().toDateString()
    const used = stored<{ day: string; n: number }>("style_auto", { day: today, n: 0 })
    const n = used.day === today ? used.n : 0
    if (!pro && n >= FREE_PICKS) return onPlans(`You've used today's ${FREE_PICKS} free outfit picks. Pro picks as many as you like.`)
    store("style_auto", { day: today, n: n + 1 })
    const { outfit: o, notes } = chooseOutfit(style, gender, have, bodyB)
    setOutfit({ top: DEFAULT_OUTFIT.top, ...o })
    setAutoStyle(style)
    setAutoNotes(notes)
    track("style_choose_for_me", { style, n: n + 1 })
  }

  // ── face: the scan is asked for only here ──
  const [shape, setShape] = useState<ShapeResult>()
  const [scanOpen, setScanOpen] = useState(false)
  const [hairline, setHairline] = useState<Hairline | "">("")
  const [texture, setTexture] = useState<Texture | "">("")
  const [budget, setBudget] = useState<1 | 2 | 3 | undefined>()
  const [face, setFace] = useState<Look>({})
  const a: Answers = { gender, build: ({ slim: "slim", average: "average", athletic: "athletic", plus: "bigger" } as const)[bodyB], hairline: hairline || undefined, texture: texture || undefined, budget }
  const faceCards = useMemo(() => shape ? Object.fromEntries(FACE.map((t) => [t.id, cards(t.id, a, shape)])) as Record<string, Card[]> : {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shape, gender, bodyB, hairline, texture, budget])
  function scanned({ ratios, frame }: ScanResult) {
    const s = classify(ratios)
    setShape(s)
    setPhoto((p) => p ?? frame)
    setScanOpen(false)
    setFace({ hair: cards("hair", a, s)[0]?.id })
    track("style_scan_done", { shape: s.shape })
    if (pro) setView("photo")
    else onPlans(`You have a ${s.shape} face. See the haircuts that suit it on your own face with Ollie Pro.`)
  }

  // ── Pro: on your own photo ──
  const [view, setView] = useState<"model" | "photo">("model")
  const [photo, setPhoto] = useState<string>()
  const [shown, setShown] = useState<string | null>(null) // null = their original photo
  const [renders, setRenders] = useState<string[]>([])
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const summary = useRef<HTMLElement>(null)
  const onYou = (why = "Trying looks on your own photo is part of Ollie Pro.") => (pro ? setView("photo") : onPlans(why))
  const thanks = typeof window !== "undefined" && new URLSearchParams(location.search).get("pro") === "thanks"

  async function render() {
    if (!photo) return
    setError(null)
    setBusy(true)
    track("style_render")
    try {
      const res = await fetch("/api/style-render", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ image: photo, look: { ...face, ...outfit }, texture: texture || undefined, consent }),
      })
      const d = await res.json().catch(() => ({}))
      if (d.code === "signin") return openModal(undefined, "signup")
      if (d.code === "pro_required") return onPlans()
      if (!res.ok || !d.image) throw new Error(d.error || "The preview failed. Please try again.")
      setRenders((r) => [...r, d.image])
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
    setPhoto(await shrink(f))
    setShown(null)
  }

  const pickedClothes = SLOTS.flatMap((s) => {
    const it = outfit[s.id] ? ITEMS.find((i) => i.id === outfit[s.id]) : undefined
    return it ? [{ label: s.label, it }] : []
  })
  const pickedFace = FACE.flatMap((t) => {
    const c = face[t.id] ? faceCards[t.id]?.find((x) => x.id === face[t.id]) : undefined
    return c ? [{ label: t.label, c }] : []
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]">
        {/* ── preview ── */}
        <section className={`${glassOpen} flex flex-col gap-4 p-5 md:p-6`} aria-label="Preview" aria-busy={busy}>
          {thanks && (
            <p role="status" className="rounded-xl border border-(--ollie-cyan)/30 bg-(--ollie-cyan)/10 p-3 text-sm text-white">
              Thanks! Your payment went through. Pro unlocks on your account within a minute.
            </p>
          )}
          <Tabs value={view} onValueChange={(v) => (v === "photo" ? onYou() : setView("model"))} className="flex flex-col gap-4">
            <TabsList className="grid h-auto w-full grid-cols-2">
              <TabsTrigger value="model" className="gap-1.5"><Shirt size={14} aria-hidden="true" />On the model</TabsTrigger>
              <TabsTrigger value="photo" className="gap-1.5"><Crown size={14} aria-hidden="true" />On you{pro === false && " · Pro"}</TabsTrigger>
            </TabsList>

            <TabsContent value="model" className="flex flex-col gap-3">
              {/* layers stacked in the browser: any outfit shows instantly and costs nothing */}
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[min(30rem,62svh*0.75)] overflow-hidden rounded-2xl bg-gradient-to-b from-[#aea296] to-[#bbafa5]">
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static model photo */}
                  <img src={u(modelPhoto(gender, bodyB, look))} alt={`A ${LOOKS.find((l) => l.id === look)?.label} ${gender === "male" ? "male" : "female"} model with ${bodyB === "slim" || bodyB === "plus" ? "a" : "an"} ${bodyB} build`} className="absolute inset-0 size-full object-cover" />
                  {stack.map((l) => (
                    // eslint-disable-next-line @next/next/no-img-element -- clothes layer
                    <img key={l.slot} src={u(l.src)} alt="" className="absolute inset-0 size-full object-cover"
                      style={l.mask ? { maskImage: `url(${u(l.mask)})`, WebkitMaskImage: `url(${u(l.mask)})`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" } : undefined} />
                  ))}
                </div>
              </div>
              <p className="text-center text-xs text-white/50">Every change to the model or clothes shows instantly.</p>
              {pro === false && (
                <Button variant="brand" size="cta" onClick={() => onYou("See this exact outfit on your own photo with Ollie Pro.")} className="gap-2">
                  <WandSparkles size={16} aria-hidden="true" />See this look on you
                </Button>
              )}
            </TabsContent>

            <TabsContent value="photo" className="flex flex-col gap-4">
              {photo ? (
                <div className="relative overflow-hidden rounded-2xl bg-black/35">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
                  <img src={shown ?? photo} alt={shown ? "You with the new look" : "Your photo"} className="mx-auto max-h-[min(36rem,62svh)] w-full object-contain" />
                  {busy && (
                    <div className="absolute inset-0 flex items-end bg-black/60 p-5">
                      <ProgressiveFluxLoader phases={PHASES} duration={18} loop={false} className="w-full gap-3 [--flux-from:var(--ollie-cyan)] [--flux-to:var(--ollie-cyan)]" />
                    </div>
                  )}
                </div>
              ) : (
                <p className="rounded-2xl bg-black/35 p-4 text-sm text-white/70">Add a full-body photo, or scan your face in Hair &amp; face, to try your look on yourself.</p>
              )}
              {renders.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Your previews">
                  {[null, ...renders].map((r, i) => (
                    <button key={i} onClick={() => setShown(r)} aria-pressed={shown === r}
                      className={`relative size-16 shrink-0 overflow-hidden rounded-xl border-2 ${shown === r ? "border-(--ollie-cyan)" : "border-transparent"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)`}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
                      <img src={r ?? photo} alt={r ? `Preview ${i}` : "Original photo"} className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <label className="flex items-start gap-2.5 text-sm text-white/70">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.currentTarget.checked)} className="mt-0.5 size-4 accent-(--ollie-cyan)" />
                <span>Send my photo to Google&apos;s Gemini to create the preview. Ollie doesn&apos;t keep it, and Google is asked not to store it.</span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="brand" size="cta" onClick={render} disabled={busy || !consent || !photo} className="gap-2 sm:flex-1">
                  <WandSparkles size={16} aria-hidden="true" />Try this look on me
                </Button>
                <Button variant="brandOutline" size="cta" asChild className="gap-2">
                  <label className="cursor-pointer">
                    <ImageUp size={16} aria-hidden="true" />Use a full-body photo
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="sr-only" />
                  </label>
                </Button>
              </div>
              {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            </TabsContent>
          </Tabs>
        </section>

        {/* ── controls ── */}
        <section className={`${glassOpen} flex min-h-0 flex-col gap-4 p-5 md:p-6`} aria-label="Edit the look">
          <Tabs defaultValue="model" className="flex min-h-0 flex-col gap-4">
            <TabsList className="grid h-auto w-full grid-cols-3">
              <TabsTrigger value="model">Model</TabsTrigger>
              <TabsTrigger value="clothes">Clothes</TabsTrigger>
              <TabsTrigger value="face">Hair &amp; face</TabsTrigger>
            </TabsList>

            {/* model */}
            <TabsContent value="model" className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-white">Model</p>
                <SegmentedControl label="Model gender" value={gender} onValueChange={(v) => setG(v as Gender)}
                  options={[{ value: "male", label: "Men" }, { value: "female", label: "Women" }]} className="w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-white">Body type</p>
                <SegmentedControl label="Body type" value={bodyB} onValueChange={(v) => { setModel({ build: v as Build }); track("style_model_build", { build: v }) }}
                  options={BUILDS.map((b) => ({ value: b.id, label: b.label, disabled: !looksFor(gender, b.id).length }))} className="w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-white">Looks like</p>
                <div className="grid grid-cols-3 gap-2">
                  {LOOKS.filter((l) => looksFor(gender, bodyB).includes(l.id)).map((l) => (
                    <button key={l.id} type="button" onClick={() => { setModel({ lookId: l.id }); track("style_model_look", { look: l.id }) }} aria-pressed={look === l.id} className={optionBtn(look === l.id)}>
                      <ProductCard className="max-w-none" size="sm">
                        <ProductCardImage className="relative aspect-square overflow-hidden">
                          {[modelPhoto(gender, bodyB, l.id), have.includes(DEFAULT_OUTFIT.top!) && `/style/layers/${body(gender, bodyB)}/${DEFAULT_OUTFIT.top}.webp`].filter(Boolean).map((src) => u(src as string)).map((src) => (
                            // eslint-disable-next-line @next/next/no-img-element -- model photo + the tee layer, cropped to the face
                            <img key={src as string} src={src as string} alt="" loading="lazy" className="absolute left-1/2 top-0 h-[300%] max-w-none -translate-x-1/2" />
                          ))}
                        </ProductCardImage>
                        <ProductCardContent><ProductCardTitle className="text-xs">{l.label}</ProductCardTitle></ProductCardContent>
                      </ProductCard>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* clothes */}
            <TabsContent value="clothes" className="flex min-h-0 flex-col gap-4">
              <SegmentedControl label="How to pick clothes" value={clothesMode} onValueChange={(v) => setClothesMode(v as "pick" | "auto")}
                options={[{ value: "pick", label: "Pick myself" }, { value: "auto", label: "Choose for me" }]} className="w-full" />
              {clothesMode === "auto" ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-white/70">What look are you going for? Ollie picks real pieces that suit it and the body type.</p>
                  <div className="grid max-h-[min(30rem,55svh)] grid-cols-2 gap-2 overflow-y-auto pr-1">
                    {(Object.keys(STYLES) as Style[]).map((s) => (
                      <button key={s} type="button" onClick={() => chooseForMe(s)} aria-pressed={autoStyle === s}
                        className={`${optionBtn(autoStyle === s)} flex flex-col gap-1 bg-black/35 p-3`}>
                        <span className="text-sm font-bold text-white">{STYLES[s].label}</span>
                        <span className="text-xs leading-snug text-white/60">{STYLES[s].blurb}</span>
                      </button>
                    ))}
                  </div>
                  {autoNotes.length > 0 && <ul className="list-disc pl-5 text-sm text-white/70">{autoNotes.map((n) => <li key={n}>{n}</li>)}</ul>}
                  {pro === false && <p className="text-xs text-white/50">{FREE_PICKS} free picks a day. <button type="button" onClick={() => onPlans()} className="font-semibold text-(--ollie-cyan)">Unlimited with Pro</button></p>}
                </div>
              ) : (
                <Tabs defaultValue="top" className="flex min-h-0 flex-col gap-3">
                  <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
                    {SLOTS.map((s) => <TabsTrigger key={s.id} value={s.id}>{s.label}{outfit[s.id] && <Check size={12} className="ml-1" aria-label="picked" />}</TabsTrigger>)}
                  </TabsList>
                  {SLOTS.map((s) => (
                    <TabsContent key={s.id} value={s.id}>
                      <div className="grid max-h-[min(34rem,58svh)] grid-cols-2 gap-3 overflow-y-auto pr-1">
                        {ITEMS.filter((i) => i.slot === s.id && have.includes(i.id)).map((i) => (
                          <Option key={i.id} card={{ ...i, best: !!autoStyle && i.styles.includes(autoStyle), links: [] }} on={outfit[s.id] === i.id}
                            icon={s.icon} thumb={{ src: u(`/style/layers/${body(gender, bodyB)}/${i.id}.webp`), fit: THUMB[s.id] }} onClick={() => wear(s.id, i.id)} />
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </TabsContent>

            {/* hair & face */}
            <TabsContent value="face" className="flex min-h-0 flex-col gap-4">
              {!shape ? (
                <div className="flex flex-col gap-3 rounded-2xl bg-black/35 p-5">
                  <ScanFace size={28} className="text-(--ollie-cyan)" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-white">Find the haircut that suits your face</h3>
                  <ul className="flex flex-col gap-1.5 text-sm text-white/70">
                    <li>A 10-second face scan works out your face shape.</li>
                    <li>It runs on your device. Your camera feed is never uploaded.</li>
                    <li>Then see haircuts, beards and glasses ranked for you.</li>
                  </ul>
                  <Button variant="brand" size="cta" onClick={() => { setScanOpen(true); track("style_scan_open") }} className="gap-2"><ScanFace size={16} aria-hidden="true" />Scan my face</Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-white/70">Face shape: <span className="font-semibold capitalize text-white">{shape.shape}</span>. {SHAPE_INFO[shape.shape]}{" "}
                    <button type="button" onClick={() => setScanOpen(true)} className="font-semibold text-(--ollie-cyan)">Rescan</button></p>
                  <div className="grid grid-cols-2 gap-2">
                    <select aria-label="Your hairline" value={hairline} onChange={(e) => setHairline(e.currentTarget.value as Hairline | "")} className={select}>
                      <option value="">Hairline: any</option>
                      <option value="full">Full</option>
                      <option value="slight">Slightly receding</option>
                      <option value="receding">Receding</option>
                      <option value="thinning">Thinning on top</option>
                      <option value="bald">Bald or nearly</option>
                    </select>
                    <select aria-label="Your hair texture" value={texture} onChange={(e) => setTexture(e.currentTarget.value as Texture | "")} className={select}>
                      <option value="">Hair type: any</option>
                      <option value="straight">Straight</option>
                      <option value="wavy">Wavy</option>
                      <option value="curly">Curly</option>
                      <option value="coily">Coily</option>
                    </select>
                  </div>
                  <Tabs defaultValue="hair" className="flex min-h-0 flex-col gap-3">
                    <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
                      {FACE.filter((t) => t.id !== "beard" || gender === "male").map((t) => (
                        <TabsTrigger key={t.id} value={t.id} className="gap-1">{t.label}{t.pro && !pro && <Lock size={11} aria-label="Pro" />}{face[t.id] && <Check size={12} aria-label="picked" />}</TabsTrigger>
                      ))}
                    </TabsList>
                    {FACE.map((t) => (
                      <TabsContent key={t.id} value={t.id}>
                        {t.pro && !pro ? (
                          <div className="flex flex-col gap-3 rounded-2xl bg-black/35 p-4">
                            <p className="text-sm text-white/70">Brow shape changes how your whole face reads. Pro matches brow shapes to your face shape and shows them on your photo.</p>
                            <Button variant="brand" size="cta" onClick={() => onPlans("Brow shapes matched to your face are part of Ollie Pro.")} className="gap-2"><Crown size={16} aria-hidden="true" />Unlock with Pro</Button>
                          </div>
                        ) : (
                          <div className="grid max-h-[min(30rem,52svh)] grid-cols-2 gap-3 overflow-y-auto pr-1">
                            {faceCards[t.id]?.map((c) => (
                              <Option key={c.id} card={c} on={face[t.id] === c.id} icon={t.icon}
                                onClick={() => setFace((f) => ({ ...f, [t.id]: f[t.id] === c.id ? undefined : c.id }))} />
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                  {pro === false && (
                    <Button variant="brandOutline" size="cta" onClick={() => onYou("See this haircut on your own face with Ollie Pro.")} className="gap-2">
                      <Sparkles size={16} aria-hidden="true" />See this haircut on me
                    </Button>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
          <Button variant="brand" size="cta" className="mt-auto gap-2 rounded-full" onClick={() => summary.current?.scrollIntoView({ behavior: "smooth" })}>
            <ShoppingBag size={16} aria-hidden="true" />Shop the look · {pickedClothes.length + pickedFace.length} piece{pickedClothes.length + pickedFace.length === 1 ? "" : "s"}
          </Button>
        </section>
      </div>

      {/* ── your look: shop links ── */}
      <section ref={summary} className={`${glassOpen} flex flex-col gap-5 p-5 md:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black tracking-tight text-white">Your look</h2>
          <select aria-label="Budget" value={budget ?? ""} onChange={(e) => setBudget(e.currentTarget.value ? (Number(e.currentTarget.value) as 1 | 2 | 3) : undefined)} className={select}>
            <option value="">Any budget</option>
            <option value="1">Budget-friendly</option>
            <option value="2">Mid-range</option>
            <option value="3">Premium</option>
          </select>
        </div>
        {pickedClothes.map(({ label, it }) => (
          <div key={it.id} className="flex flex-col gap-2 rounded-2xl bg-black/35 p-4">
            <h3 className="text-lg font-bold text-white"><span className="mr-2 text-sm font-semibold text-(--ollie-cyan)">{label}</span>{it.name}</h3>
            <p className="text-sm text-white/60">{it.sub}</p>
            <Links links={[{ label: `View at ${it.brand}`, href: it.url }]} where={`${it.slot}:${it.id}`} />
          </div>
        ))}
        {pickedFace.map(({ label, c }) => (
          <div key={c.id} className="flex flex-col gap-2 rounded-2xl bg-black/35 p-4">
            <h3 className="text-lg font-bold text-white"><span className="mr-2 text-sm font-semibold text-(--ollie-cyan)">{label}</span>{c.name}</h3>
            {c.why && <p className="text-sm text-white/60">{c.why}</p>}
            {c.cut && (
              <>
                <p className="text-sm leading-relaxed text-white/70"><span className="font-semibold text-white">Ask for: </span>{c.cut.ask}</p>
                <ol className="list-decimal pl-5 text-sm leading-relaxed text-white/70">{c.cut.styling.map((s) => <li key={s}>{s}</li>)}</ol>
              </>
            )}
            <Links links={c.links} where={`face:${c.id}`} />
          </div>
        ))}
        {fitNotes(a).length > 0 && <ul className="list-disc pl-5 text-sm leading-relaxed text-white/70">{fitNotes(a).map((n) => <li key={n}>{n}</li>)}</ul>}
        <p className="text-xs text-white/50">Ollie earns a commission from some links. As an Amazon Associate, Ollie earns from qualifying purchases.</p>
      </section>

      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan your face</DialogTitle>
            <DialogDescription>Look straight at the camera for a few seconds. The scan runs on your device.</DialogDescription>
          </DialogHeader>
          {scanOpen && <StyleScanner onDone={scanned} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
