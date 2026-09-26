"use client"

import { useState, useRef, useCallback, useEffect, useMemo, DragEvent, ChangeEvent } from "react"
import Link from "next/link"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { Upload, X, Search, Loader2, AlertCircle, User, Camera, ChevronDown, RotateCcw, ImageIcon, ScanFace } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { MATCH_ONLY } from "@/lib/site-config"
import { INDEX } from "@/lib/facts"
import { ShareMatch } from "@/components/share-match"
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader"
import { glass, glassOpen } from "@/lib/surfaces"

// Who took the photo and under which license: CC BY / BY-SA require this next to every photo shown.
interface Credit {
  author: string
  license: string
  license_url?: string
  page?: string // the photo's Wikimedia Commons page
}

interface Match {
  name: string
  similarity: number
  image?: string
  credit?: Credit
  knownFor?: string
}

// What the matching server returns from POST /search (credits/known_for only once the celebrity index is live)
interface SearchResponse {
  face_found: boolean
  gender_used?: "female" | "male" | null
  modes: Record<string, { name: string; score: number }[]>
  thumbs: Record<string, string>
  credits?: Record<string, Credit>
  known_for?: Record<string, string>
  remaining: number | null // searches left; null = not shown
}

// Who to show. "auto" (default) = the gender InsightFace estimates from the uploaded face, matched against each
// celebrity's Wikidata gender; the server reports what it used in gender_used.
const GENDER_OPTIONS = [
  { value: "auto", label: "Auto-detect" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const
type Gender = (typeof GENDER_OPTIONS)[number]["value"]

// Which celebrities to compare with, from each person's Wikidata description (server.py CATEGORY_NAMES).
const CATEGORIES = [
  { value: "any", label: "All celebrities" },
  { value: "actor", label: "Actors" },
  { value: "musician", label: "Singers" },
  { value: "footballer", label: "Footballers" },
] as const
type Category = (typeof CATEGORIES)[number]["value"]

// Custom dropdown (a native <select> pops up in OS colours that clash with the dark theme)
function Menu<T extends string>({ label, options, value, onChange }: {
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="-ml-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ollie-cyan)"
      >
        <span className="text-white/60">{label}</span>
        <span className="font-semibold text-(--ollie-cyan)">{current.label}</span>
        <ChevronDown size={12} className={`text-white/60 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-20 mt-1 min-w-44 rounded-xl border border-white/10 bg-black/90 p-1 shadow-xl shadow-black/50 backdrop-blur-md"
          >
            {options.map((o) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false) }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    o.value === value ? "bg-(--ollie-cyan)/10 text-(--ollie-cyan)" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// Three icon tiles fanned behind each other; they spread apart while a photo is dragged over the drop zone
const TILES = [
  { Icon: ImageIcon, idle: "translate(-78%, -50%) rotate(-8deg)", active: "translate(-114%, -50%) rotate(-12deg) scale(1.08)" },
  { Icon: ScanFace, idle: "translate(-50%, -50%)", active: "translate(-50%, -50%) scale(1.18)" },
  { Icon: Camera, idle: "translate(-22%, -50%) rotate(8deg)", active: "translate(14%, -50%) rotate(12deg) scale(1.08)" },
]

// Raw server scores are compressed (a same-person photo tops out ~62%, unrelated faces sit ~40%).
// Linear stretch of [RAW_LO, RAW_HI] -> [OUT_LO, OUT_HI], clamped to 0-100; ranking is unchanged. Tune the four constants.
// Most faces land at raw 30-42, so that band is spread over 20-80%; a same-person photo (raw ~47+) hits 100%.
const RAW_LO = 30, RAW_HI = 41.7, OUT_LO = 20, OUT_HI = 80
export const scale = (raw: number) =>
  Math.max(0, Math.min(100, OUT_LO + ((raw - RAW_LO) * (OUT_HI - OUT_LO)) / (RAW_HI - RAW_LO)))

// One scoring mode now; take whichever the server sends first (older servers sent two).
function parseResponse(data: SearchResponse): Match[] {
  const rows = Object.values(data.modes ?? {})[0] ?? []
  return rows.map((r) => ({
    name: r.name,
    similarity: scale(r.score),
    image: data.thumbs?.[r.name],
    credit: data.credits?.[r.name],
    knownFor: data.known_for?.[r.name],
  }))
}

function PhotoCredit({ credit, className = "" }: { credit: Credit; className?: string }) {
  const link = "underline decoration-white/20 underline-offset-2 hover:text-white/70"
  return (
    <p className={`text-[10px] leading-snug text-white/60 ${className}`}>
      Photo:{" "}
      {credit.page ? (
        <a href={credit.page} target="_blank" rel="noopener noreferrer" className={link}>{credit.author}</a>
      ) : credit.author}
      ,{" "}
      {credit.license_url ? (
        <a href={credit.license_url} target="_blank" rel="noopener noreferrer license" className={link}>{credit.license}</a>
      ) : credit.license}{" "}
      (cropped), via Wikimedia Commons
    </p>
  )
}

// The server doesn't report progress, so the bar follows elapsed time: it eases toward 95% and only
// completes when results arrive. Labels are the steps a search goes through, roughly when they happen
// (28% ≈ 2 s, 63% ≈ 6 s, 95% ≈ 18 s on this curve).
const SEARCH_PHASES = [
  { at: 0, label: "Uploading your photo…" },
  { at: 28, label: "Finding your face…" },
  { at: 63, label: `Comparing with ${INDEX.celebrities} celebrities…` },
  { at: 95, label: "Still working…" },
]

function SearchProgress({ elapsed, className = "" }: { elapsed: number; className?: string }) {
  const pct = Math.min(95, 100 * (1 - Math.exp(-elapsed / 6)))
  return (
    <div className={className}>
      <ProgressiveFluxLoader
        value={pct}
        phases={SEARCH_PHASES}
        className="gap-3 [--flux-from:var(--ollie-purple)] [--flux-to:var(--ollie-cyan)]"
        barClassName="h-2 bg-white/10 shadow-none"
        textClassName="text-base sm:text-lg font-medium text-white/70"
      />
      {pct >= 95 && (
        <p className="mt-3 text-white/50 text-xs text-center text-balance">
          After a quiet spell the server needs up to a minute to start.
        </p>
      )}
    </div>
  )
}

export function CelebrityFinder() {
  const { user, openModal } = useAuth()
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null) // JPEG sent to the matcher
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)     // original file, transparency kept, for display
  // The uploaded file at full quality (an object URL, so no big base64 string in memory). Not shown anywhere yet:
  // it's the source for the photo modal, which will show this instead of the preview above. Revoked when replaced.
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [gender, setGender] = useState<Gender>("auto")
  const [category, setCategory] = useState<Category>("any")
  const [genderUsed, setGenderUsed] = useState<"female" | "male" | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const resultsRef = useRef<HTMLDivElement>(null)
  const finderRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!loading) return
    const t0 = Date.now()
    const id = setInterval(() => setElapsed((Date.now() - t0) / 1000), 250)
    return () => clearInterval(id)
  }, [loading])
  const [faceFound, setFaceFound] = useState(true)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)
  const [zoom, setZoom] = useState<Match | null>(null)
  const runnerUps = useMemo(() => matches?.slice(1) ?? [], [matches]) // stable, so the share preview isn't redrawn on every render

  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [zoom])

  useEffect(() => () => { if (originalUrl) URL.revokeObjectURL(originalUrl) }, [originalUrl])

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      // Phone photos are 3-10 MB but the matcher only needs ~1280px, and the API rejects big uploads: shrink first.
      const img = new window.Image()
      img.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(img.width, img.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "#fff" // PNGs with transparency would turn black as JPEG
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        setImageDataUrl(canvas.toDataURL("image/jpeg", 0.9))
        setPreviewUrl(img.src)
        setOriginalUrl(URL.createObjectURL(file))
        setMatches(null)
        setError(null)
      }
      img.onerror = () => setError("Couldn't read that image. Try a JPG or PNG.")
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [])

  // Ctrl+V anywhere on the page: screenshots and copied images arrive as files on the clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"))
      if (file) {
        e.preventDefault()
        loadFile(file)
      }
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [loadFile])

  const onDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) loadFile(file)
    },
    [loadFile]
  )

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
  }

  const clearImage = () => {
    setImageDataUrl(null)
    setPreviewUrl(null)
    setOriginalUrl(null)
    setMatches(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (selfieInputRef.current) selfieInputRef.current.value = ""
  }

  const tryAnother = () => {
    clearImage()
    finderRef.current?.scrollIntoView({ block: "start" })
  }

  const handleSearch = async () => {
    if (!imageDataUrl) return
    setElapsed(0)
    setLoading(true)
    setError(null)
    setMatches(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ image: imageDataUrl, gender, category }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.code === "guest_limit") openModal(() => handleSearch()) // free search used: sign in, then retry
        throw new Error(json.error || "Search failed")
      }

      const data = json as SearchResponse
      const parsed = parseResponse(data)
      if (parsed.length === 0) {
        setError("No matches found. Try a different photo.")
      } else {
        setMatches(parsed)
        setFaceFound(Boolean(data.face_found))
        setGenderUsed(gender === "auto" ? data.gender_used ?? null : null)
        setRemaining(data.remaining ?? null)
        // Phones stack the results under the uploader: bring them into view
        if (window.innerWidth < 768) {
          const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }), 50)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }


  const dropZone = `relative flex-1 rounded-2xl border border-dashed transition-[border-color,background-color] duration-200 motion-reduce:transition-none has-focus-visible:ring-2 has-focus-visible:ring-(--ollie-cyan) has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-black
    ${isDragging
      ? "border-beam border-(--ollie-cyan)/40 bg-(--ollie-glow)"
      : imageDataUrl
        ? "border-white/10 bg-white/[0.02]"
        : "border-white/15 hover:border-white/30 hover:bg-white/[0.03] cursor-pointer"
    }`
  const dragProps = {
    onDragOver: (e: DragEvent<HTMLElement>) => { e.preventDefault(); setIsDragging(true) },
    onDragLeave: () => setIsDragging(false),
    onDrop,
  }

  return (
    <section ref={finderRef} id="finder" className={`scroll-mt-20 px-6 ${MATCH_ONLY ? "flex min-h-svh flex-col pt-[clamp(5rem,11svh,7rem)] pb-[clamp(1rem,4svh,3rem)]" : "py-24 md:py-32"}`}>
      {/* One screen tall: the uploader and results share whatever height is left under the title, so the whole tool
          shows on a short laptop and fills a tall monitor (the "Good to know" section starts below the fold). */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        {/* Header: static so it's in the server HTML at full opacity (LCP) */}
        <div className="mb-[clamp(0.75rem,3svh,1.75rem)] text-center">
          <h1 className="fluid-h1-sm font-black text-white tracking-[-0.015em] leading-[1.05] text-balance">
            What celebrity do I look like?
          </h1>
          <p className="mt-3 text-white/70 text-base leading-relaxed text-pretty">
            Find your celebrity look alike: the five actors, actresses and stars you look most like.
          </p>
          <p className="mt-1 text-white/50 text-sm text-balance">
            Best with one clear, front-facing face in even light.
          </p>
        </div>

        <div className={`grid grid-cols-1 gap-6 md:min-h-[clamp(26rem,calc(100svh-17rem),54rem)] md:grid-cols-2 ${matches ? "md:items-start" : "md:items-stretch"}`}>
          {/* LEFT: Uploader */}
          <div className={`${glassOpen} flex flex-col gap-5 p-5 md:p-6 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-backwards motion-reduce:animate-none`}>
            {/* Drop zone: a label around the file input, so it works with the keyboard and screen readers */}
            {imageDataUrl ? (
              <div {...dragProps} className={`${dropZone} flex items-center justify-center`} style={{ minHeight: "clamp(9rem, 24svh, 15rem)" }}>
                <div className="relative flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl ?? imageDataUrl}
                    alt="Your uploaded photo"
                    className="max-w-full max-h-[min(20rem,40svh)] rounded-xl object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 border border-white/10 text-white hover:bg-black/90 transition-colors"
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <label {...dragProps} className={`${dropZone} block`} style={{ minHeight: "clamp(9rem, 24svh, 15rem)" }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onFileChange}
                />
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
                  <span className="relative block h-14 w-36" aria-hidden="true">
                    {TILES.map(({ Icon, idle, active }, i) => (
                      <span
                        key={i}
                        className={`absolute top-1/2 left-1/2 grid size-12 place-items-center rounded-xl bg-(--ollie-card) ring-1 ring-white/15 shadow-md shadow-black/40 transition-[transform,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none
                          ${i === 1 ? "z-10" : ""} ${isDragging ? "text-(--ollie-cyan) shadow-lg shadow-black/40" : "text-white/50"}`}
                        style={{ transform: isDragging ? active : idle }}
                      >
                        <Icon size={20} />
                      </span>
                    ))}
                  </span>
                  <span className="space-y-1">
                    <span className="block text-sm font-medium text-white/80">Click to upload or drop a photo</span>
                    <span className="block text-xs text-white/50">JPG, PNG or WEBP. You can also paste with Ctrl+V</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/60">
                    <Upload size={14} aria-hidden="true" />
                    {isDragging ? "Drop to add" : "Browse files"}
                  </span>
                </span>
              </label>
            )}

            {/* Phones: straight to the front camera */}
            {!imageDataUrl && (
              <label className="md:hidden flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white/70 text-sm font-semibold has-focus-visible:ring-2 has-focus-visible:ring-(--ollie-cyan) cursor-pointer">
                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="sr-only"
                  onChange={onFileChange}
                />
                <Camera size={16} aria-hidden="true" />
                Take a selfie
              </label>
            )}

            {/* Who to compare with */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Menu label="Gender" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
              <Menu label="Compare with" options={CATEGORIES} value={category} onChange={setCategory} />
            </div>

            {/* Search button */}
            <button
              type="button"
              onClick={handleSearch}
              disabled={!imageDataUrl || loading}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all
                ${imageDataUrl && !loading
                  ? "bg-(--ollie-cyan) text-black hover:opacity-90 active:scale-[0.98]"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Finding your matches…
                </>
              ) : (
                <>
                  <Search size={16} aria-hidden="true" />
                  Find my match
                </>
              )}
            </button>
            {/* Phones: progress right where they tapped (the results panel is further down) */}
            {loading && <SearchProgress elapsed={elapsed} className="md:hidden" />}
            <p className="text-center text-xs text-white/50">
              Your photo is only used for this search and is never stored.{" "}
              <Link href="/privacy" className="underline decoration-white/20 underline-offset-2 hover:text-white/60">Privacy</Link>
            </p>
            {remaining !== null && (
              <p className="text-center text-xs text-white/60">
                {remaining === 0
                  ? user ? "You've used all your searches." : "That was your last free search. Sign in for more."
                  : `${remaining} free search${remaining === 1 ? "" : "es"} left`}
              </p>
            )}
          </div>

          {/* RIGHT: Results (announced to screen readers when they change) */}
          <div ref={resultsRef} className="flex flex-col gap-4 scroll-mt-20 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-backwards motion-reduce:animate-none">
            <div className={`${glass} flex-1 p-5 md:p-6`} style={{ minHeight: "clamp(16rem, 40svh, 24rem)" }} aria-live="polite" aria-busy={loading}>
              {/* Placeholder: same footprint as the results so nothing jumps */}
              {!loading && !matches && !error && (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <User size={32} className="text-white/25" aria-hidden="true" />
                  <div>
                    <p className="text-white/70 font-medium">Your top 5 matches will appear here</p>
                    <p className="text-white/50 text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">
                      Your closest celebrity first, then four runners-up
                    </p>
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="h-full hidden md:flex flex-col justify-center gap-5 py-16 px-2">{/* phones show the bar under the button instead */}
                  <SearchProgress elapsed={elapsed} />
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div role="alert" className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                </div>
              )}

              {/* Results: #1 big, next to your photo, then the runners-up */}
              {matches && !loading && (
                <MotionConfig reducedMotion="user">
                  <div className="flex flex-col gap-4">
                    <p className="sr-only">
                      Top {matches.length} matches ready. Number 1 is {matches[0].name}, {matches[0].similarity.toFixed(0)} percent.
                    </p>
                    {!faceFound && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-amber-200/80 text-xs leading-relaxed">
                          We couldn&apos;t find a clear face in your photo, so these matches may be off. Try a front-facing photo.
                        </p>
                      </div>
                    )}

                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h2 className="text-white/70 text-sm font-semibold">Your closest match</h2>
                        {genderUsed && (
                          <p className="text-xs text-white/50">{genderUsed === "male" ? "Men" : "Women"} only, estimated from your photo</p>
                        )}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <figure>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={previewUrl ?? imageDataUrl ?? ""} alt="Your photo" className="aspect-square w-full rounded-xl object-cover border border-white/10" />
                          <figcaption className="mt-1.5 text-xs text-white/60">You</figcaption>
                        </figure>
                        <figure>
                          <button
                            type="button"
                            disabled={!matches[0].image}
                            onClick={() => setZoom(matches[0])}
                            aria-label={`View photo of ${matches[0].name} full size`}
                            className="block w-full aspect-square rounded-xl overflow-hidden bg-white/5 border border-(--ollie-cyan)/40 enabled:cursor-zoom-in"
                          >
                            {matches[0].image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={matches[0].image} alt={`Photo of ${matches[0].name}`} className="h-full w-full object-cover" />
                            ) : (
                              <User size={40} className="mx-auto text-white/60" aria-hidden="true" />
                            )}
                          </button>
                          <figcaption className="mt-1.5 truncate text-xs text-white/60">{matches[0].name}</figcaption>
                        </figure>
                      </div>
                      <div className="mt-4 flex items-baseline justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-2xl font-black text-white tracking-tight text-balance">{matches[0].name}</p>
                          {matches[0].knownFor && <p className="mt-0.5 text-sm text-white/60">{matches[0].knownFor}</p>}
                        </div>
                        <p className="shrink-0 text-2xl font-black text-(--ollie-cyan) tabular-nums tracking-tight">
                          {matches[0].similarity.toFixed(1)}%
                        </p>
                      </div>
                      {matches[0].credit && <PhotoCredit credit={matches[0].credit} className="mt-2" />}
                    </motion.div>

                    {matches.length > 1 && (
                      <div>
                        <h2 className="text-white/70 text-sm font-semibold">Runners-up</h2>
                        <ol className="mt-2 flex flex-col gap-2">
                          {matches.slice(1).map((match, j) => (
                            <motion.li
                              key={`${match.name}-${j}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + j * 0.07 }}
                              className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5"
                            >
                              <span className="w-4 shrink-0 text-center text-xs font-bold text-white/60 tabular-nums">{j + 2}</span>
                              <button
                                type="button"
                                disabled={!match.image}
                                onClick={() => setZoom(match)}
                                aria-label={`View photo of ${match.name} full size`}
                                className="size-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 enabled:cursor-zoom-in enabled:hover:border-(--ollie-cyan)/50"
                              >
                                {match.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={match.image} alt={`Photo of ${match.name}`} className="h-full w-full object-cover" />
                                ) : (
                                  <User size={22} className="mx-auto text-white/60" aria-hidden="true" />
                                )}
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-2">
                                  <span className="truncate text-sm font-semibold text-white">{match.name}</span>
                                  <span className="shrink-0 text-xs font-bold text-(--ollie-cyan) tabular-nums">{match.similarity.toFixed(1)}%</span>
                                </div>
                                {match.knownFor && <p className="truncate text-xs text-white/60">{match.knownFor}</p>}
                                {match.credit && <PhotoCredit credit={match.credit} className="mt-0.5 line-clamp-1" />}
                              </div>
                            </motion.li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* What next: two equal buttons on one row */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={tryAnother}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"
                      >
                        <RotateCcw size={14} aria-hidden="true" />
                        Try another photo
                      </button>
                      <ShareMatch match={matches[0]} runnerUps={runnerUps} userPhoto={previewUrl ?? imageDataUrl} buttonClassName="flex-1" />
                    </div>
                  </div>
                </MotionConfig>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Full-size viewer */}
      {zoom?.image && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo of ${zoom.name}`}
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/85 p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom.image} alt={`Photo of ${zoom.name}`} className="w-[min(90vw,80vh)] aspect-square rounded-2xl object-cover" />
          <p className="text-white font-semibold">
            {zoom.name} <span className="text-(--ollie-cyan) ml-1">{zoom.similarity.toFixed(1)}%</span>
          </p>
          {zoom.credit && (
            <div onClick={(e) => e.stopPropagation()} className="max-w-md text-center cursor-auto">
              <PhotoCredit credit={zoom.credit} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
