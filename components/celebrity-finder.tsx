"use client"

import { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Upload, X, Search, Loader2, AlertCircle, User, Camera, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { MATCH_ONLY } from "@/lib/site-config"
import { ShareMatch } from "@/components/share-match"

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

// Who to show. "any" = no filter (default); the server can also do "auto" (same apparent gender as the
// uploaded face), which isn't offered here.
const GENDER_OPTIONS = [
  { value: "any", label: "Any gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const
type Gender = (typeof GENDER_OPTIONS)[number]["value"]

// Custom dropdown (a native <select> pops up in OS colours that clash with the dark theme)
function GenderMenu({ value, onChange }: { value: Gender; onChange: (g: Gender) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = GENDER_OPTIONS.find((o) => o.value === value) ?? GENDER_OPTIONS[0]

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
    <div ref={ref} className="relative self-start">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Show matches: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
        className="-ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ollie-cyan)"
      >
        <span className="text-white/30">Show</span>
        <span className="font-semibold text-(--ollie-cyan)">{current.label}</span>
        <ChevronDown size={12} className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Show matches"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-20 mt-1 min-w-44 rounded-xl border border-white/10 bg-black/90 p-1 shadow-xl shadow-black/50 backdrop-blur-md"
          >
            {GENDER_OPTIONS.map((o) => (
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

// Raw server scores are compressed (a same-person photo tops out ~62%, unrelated faces sit ~40%).
// Linear stretch of [RAW_LO, RAW_HI] -> [OUT_LO, 99]; ranking is unchanged. Tune the three constants.
const RAW_LO = 30, RAW_HI = 65, OUT_LO = 40
const scale = (raw: number) => Math.max(0, Math.min(99, OUT_LO + ((raw - RAW_LO) * (99 - OUT_LO)) / (RAW_HI - RAW_LO)))

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
    <p className={`text-[10px] leading-snug text-white/30 ${className}`}>
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

export function CelebrityFinder() {
  const { user, openModal } = useAuth()
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [gender, setGender] = useState<Gender>("any")
  const [faceFound, setFaceFound] = useState(true)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)
  const [zoom, setZoom] = useState<Match | null>(null)

  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [zoom])

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
    setMatches(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (selfieInputRef.current) selfieInputRef.current.value = ""
  }

  const handleSearch = async () => {
    if (!imageDataUrl) return
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
        body: JSON.stringify({ image: imageDataUrl, gender }),
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
        setRemaining(data.remaining ?? null)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }


  const dropZone = `relative block rounded-2xl border-2 border-dashed transition-all focus-within:ring-2 focus-within:ring-(--ollie-cyan) focus-within:ring-offset-2 focus-within:ring-offset-black
    ${isDragging
      ? "border-(--ollie-cyan) bg-(--ollie-glow)"
      : imageDataUrl
        ? "border-white/10 bg-white/[0.02]"
        : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.03] cursor-pointer"
    }`
  const dragProps = {
    onDragOver: (e: DragEvent<HTMLElement>) => { e.preventDefault(); setIsDragging(true) },
    onDragLeave: () => setIsDragging(false),
    onDrop,
  }

  return (
    <section id="finder" className={`px-6 ${MATCH_ONLY ? "pt-28 pb-24" : "py-24 md:py-32 border-t border-white/5"}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header: static so it's in the server HTML at full opacity (LCP) */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Which celebrity do you look like?
          </h1>
          <p className="mt-4 text-white/45 text-balance">
            Upload a photo. Ollie compares your face with thousands of celebrity photos and shows your five closest matches.
          </p>
          <p className="mt-2 text-white/30 text-sm text-balance">
            Works best with one clear, front-facing face in good, even lighting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* LEFT: Uploader */}
          <div className="flex flex-col gap-5">
            {/* Drop zone: a label around the file input, so it works with the keyboard and screen readers */}
            {imageDataUrl ? (
              <div {...dragProps} className={dropZone} style={{ minHeight: 280 }}>
                <div className="relative flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageDataUrl}
                    alt="Your uploaded photo"
                    className="max-w-full max-h-[380px] rounded-xl object-contain"
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
              <label {...dragProps} className={dropZone} style={{ minHeight: 280 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onFileChange}
                />
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                  <span className="p-4 rounded-full bg-white/5 border border-white/10">
                    <Upload size={28} className="text-white/40" aria-hidden="true" />
                  </span>
                  <span className="text-center">
                    <span className="block text-white/70 font-medium">Drag &amp; drop your photo</span>
                    <span className="block text-white/30 text-sm mt-1">click to browse, or paste with Ctrl+V</span>
                  </span>
                  <span className="text-white/20 text-xs">JPG, PNG, WEBP</span>
                </span>
              </label>
            )}

            {/* Phones: straight to the front camera */}
            {!imageDataUrl && (
              <label className="md:hidden flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white/70 text-sm font-semibold focus-within:ring-2 focus-within:ring-(--ollie-cyan) cursor-pointer">
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

            {/* Who to show */}
            <GenderMenu value={gender} onChange={setGender} />

            {/* Search button */}
            <button
              type="button"
              onClick={handleSearch}
              disabled={!imageDataUrl || loading}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all
                ${imageDataUrl && !loading
                  ? "bg-(--ollie-cyan) text-black hover:opacity-90 active:scale-[0.98] shadow-lg shadow-(--ollie-glow)"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Running your face through the network...
                </>
              ) : (
                <>
                  <Search size={16} aria-hidden="true" />
                  Find my match
                </>
              )}
            </button>
            <p className="text-center text-xs text-white/30">
              Your photo is only used for this search and is never stored.{" "}
              <Link href="/privacy" className="underline decoration-white/20 underline-offset-2 hover:text-white/60">Privacy</Link>
            </p>
            {remaining !== null && (
              <p className="text-center text-xs text-white/30">
                {remaining === 0
                  ? user ? "You've used all your searches." : "That was your last free search. Sign in for more."
                  : `${remaining} free search${remaining === 1 ? "" : "es"} left`}
              </p>
            )}
          </div>

          {/* RIGHT: Results (announced to screen readers when they change) */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5" style={{ minHeight: 380 }} aria-live="polite" aria-busy={loading}>
              {/* Placeholder */}
              {!loading && !matches && !error && (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <div className="p-4 rounded-full bg-white/5 border border-white/5">
                    <User size={32} className="text-white/20" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-white/40 font-medium">Your top 5 matches will appear here</p>
                    <p className="text-white/20 text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">
                      Each result is a celebrity, ranked by how closely their face matches yours
                    </p>
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-16">
                  <Loader2 size={36} className="text-(--ollie-cyan) animate-spin" aria-hidden="true" />
                  <div className="text-center">
                    <p className="text-white/40 text-sm">Comparing your face with thousands of celebrities...</p>
                    <p className="text-white/25 text-xs mt-1">This can take up to 15 seconds</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div role="alert" className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                </div>
              )}

              {/* Results */}
              {matches && !loading && (
                <div className="flex flex-col gap-3">
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
                  <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">
                    Top {matches.length} Matches
                  </h2>
                  {matches.map((match, i) => (
                    <motion.div
                      key={`${match.name}-${i}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                    >
                      {/* Thumbnail: click to enlarge */}
                      <button
                        type="button"
                        disabled={!match.image}
                        onClick={() => setZoom(match)}
                        aria-label={`View photo of ${match.name} full size`}
                        className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 shrink-0 flex items-center justify-center border border-white/10 enabled:cursor-zoom-in enabled:hover:border-(--ollie-cyan)/50 transition-colors"
                      >
                        {match.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={match.image} alt={`Photo of ${match.name}`} className="w-full h-full object-cover" />
                        ) : (
                          <User size={28} className="text-white/20" aria-hidden="true" />
                        )}
                      </button>

                      {/* Name, what they're known for, score bar, photo credit */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm font-semibold truncate">{match.name}</span>
                          <span className="text-(--ollie-cyan) text-xs font-bold ml-2 shrink-0">
                            {match.similarity.toFixed(1)}%
                          </span>
                        </div>
                        {match.knownFor && (
                          <p className="text-white/35 text-xs truncate mb-1.5">{match.knownFor}</p>
                        )}
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(match.similarity, 100)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 + 0.2, ease: "easeOut" }}
                            className="h-full rounded-full bg-(--ollie-cyan)"
                          />
                        </div>
                        {match.credit && <PhotoCredit credit={match.credit} className="mt-1.5 line-clamp-2" />}
                      </div>

                      {/* Rank badge */}
                      {i === 0 && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-(--ollie-cyan)/15 text-(--ollie-cyan) border border-(--ollie-cyan)/30">
                          #1
                        </span>
                      )}
                    </motion.div>
                  ))}
                  {matches[0] && <ShareMatch match={matches[0]} userPhoto={imageDataUrl} />}
                </div>
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
