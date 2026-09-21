"use client"

import { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Upload, X, Search, Loader2, AlertCircle, User, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { MATCH_ONLY } from "@/lib/site-config"
import { MatchInfo } from "@/components/match-info"


interface Match {
  name: string
  similarity: number
  image?: string
}

// What the inference server (server.py on Hugging Face) returns from POST /search
interface SearchResponse {
  face_found: boolean
  modes: Record<string, { name: string; score: number }[]>
  thumbs: Record<string, string>
  remaining: number | null // searches left on this account; null = unlimited
}

// Server mode key -> dropdown label. First entry is the default. Any other mode the server sends is
// ignored, and an older server that only sends the first one just hides the dropdown.
const MODE_LABELS: Record<string, string> = {
  "CNN Only (best image)": "CNN with tweaks",
  "CNN Only (best image, no tweaks)": "CNN only",
}
const MODE_HINTS: Record<string, string> = {
  "CNN Only (best image)": "Filters out implausible skin tones",
  "CNN Only (best image, no tweaks)": "Raw model, no filtering",
}
const MODES = Object.keys(MODE_LABELS)

// Custom dropdown (a native <select> pops up in OS colours that clash with the dark theme)
function ModeMenu({ modes, value, onChange }: { modes: string[]; value: string; onChange: (m: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
        onClick={() => setOpen((o) => !o)}
        className="-ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-white/5"
      >
        <span className="text-white/30">Mode</span>
        <span className="font-semibold text-(--ollie-cyan)">{MODE_LABELS[value] ?? value}</span>
        <ChevronDown size={12} className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-20 mt-1 min-w-56 rounded-xl border border-white/10 bg-black/90 p-1 shadow-xl shadow-black/50 backdrop-blur-md"
          >
            {modes.map((m) => (
              <li key={m} role="option" aria-selected={m === value}>
                <button
                  type="button"
                  onClick={() => { onChange(m); setOpen(false) }}
                  className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                    m === value ? "bg-(--ollie-cyan)/10" : "hover:bg-white/5"
                  }`}
                >
                  <span className={`block text-xs font-semibold ${m === value ? "text-(--ollie-cyan)" : "text-white/80"}`}>
                    {MODE_LABELS[m] ?? m}
                  </span>
                  {MODE_HINTS[m] && <span className="block text-[11px] text-white/35">{MODE_HINTS[m]}</span>}
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

function parseResponse(data: SearchResponse): Record<string, Match[]> {
  const out: Record<string, Match[]> = {}
  for (const mode of MODES) {
    const rows = data.modes?.[mode]
    if (rows?.length) {
      out[mode] = rows.map((r) => ({ name: r.name, similarity: scale(r.score), image: data.thumbs?.[r.name] }))
    }
  }
  return out
}

export function CelebrityFinder() {
  const { user, openModal } = useAuth()
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, Match[]> | null>(null)
  const [activeMode, setActiveMode] = useState(MODES[0])
  const [faceFound, setFaceFound] = useState(true)
  const [remaining, setRemaining] = useState<number | null>(null)
  const matches = results ? results[activeMode] ?? [] : null
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
        setResults(null)
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
    (e: DragEvent<HTMLDivElement>) => {
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
    setResults(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSearch = async () => {
    if (!imageDataUrl) return
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ image: imageDataUrl }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.code === "guest_limit") openModal(() => handleSearch()) // free search used: sign in, then retry
        throw new Error(json.error || "Search failed")
      }

      const parsed = parseResponse(json as SearchResponse)
      const modes = Object.keys(parsed)
      if (modes.length === 0) {
        setError("No matches found. Try a different photo.")
      } else {
        setResults(parsed)
        setActiveMode((cur) => (parsed[cur] ? cur : modes[0])) // keep the chosen mode across searches
        setFaceFound(Boolean((json as SearchResponse).face_found))
        setRemaining((json as SearchResponse).remaining ?? null)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }


  return (
    <section id="finder" className={`px-6 ${MATCH_ONLY ? "pt-28 pb-24" : "py-24 md:py-32 border-t border-white/5"}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Which soccer player do you look like?
          </h1>
          <p className="mt-4 text-white/45 text-balance">
            Upload your photo below. Ollie ranks soccer players by how similar their face is to yours.
          </p>
          <p className="mt-2 text-white/30 text-sm text-balance">
            Works best with male faces in good lighting. Poor lighting makes it difficult for the AI to determine skin tone and analyze features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* LEFT: Uploader */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => !imageDataUrl && fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer
                ${isDragging
                  ? "border-(--ollie-cyan) bg-(--ollie-glow)"
                  : imageDataUrl
                    ? "border-white/10 bg-white/[0.02]"
                    : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.03]"
                }`}
              style={{ minHeight: 280 }}
            >
              {imageDataUrl ? (
                <div className="relative flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageDataUrl}
                    alt="Uploaded preview"
                    className="max-w-full max-h-[380px] rounded-xl object-contain"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); clearImage() }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 border border-white/10 text-white hover:bg-black/90 transition-colors"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                  <div className="p-4 rounded-full bg-white/5 border border-white/10">
                    <Upload size={28} className="text-white/40" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/70 font-medium">Drag &amp; drop your photo</p>
                    <p className="text-white/30 text-sm mt-1">click to browse, or paste with Ctrl+V</p>
                  </div>
                  <span className="text-white/20 text-xs">JPG, PNG, WEBP</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>


            {/* Search button */}
            <button
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
                  <Loader2 size={16} className="animate-spin" />
                  Running your face through the network...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Find my match
                </>
              )}
            </button>
            {remaining !== null && (
              <p className="text-center text-xs text-white/30">
                {remaining === 0
                  ? user ? "You've used all your searches." : "That was your free search. Sign in for more."
                  : `${remaining} free search${remaining === 1 ? "" : "es"} left`}
              </p>
            )}
          </motion.div>

          {/* RIGHT: Results */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5" style={{ minHeight: 380 }}>
              {/* Placeholder */}
              {!loading && !matches && !error && (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <div className="p-4 rounded-full bg-white/5 border border-white/5">
                    <User size={32} className="text-white/20" />
                  </div>
                  <div>
                    <p className="text-white/40 font-medium">Your top 5 matches will appear here</p>
                    <p className="text-white/20 text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">
                      Each result is a player ranked by how closely your facial structure matches theirs
                    </p>
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-16">
                  <Loader2 size={36} className="text-(--ollie-cyan) animate-spin" />
                  <div className="text-center">
                    <p className="text-white/40 text-sm">Comparing your face across 2,200+ soccer players...</p>
                    <p className="text-white/25 text-xs mt-1">This can take up to 15 seconds</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                </div>
              )}

              {/* Results */}
              {results && matches && !loading && (
                <div className="flex flex-col gap-3">
                  {!faceFound && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-amber-200/80 text-xs leading-relaxed">
                        We couldn&apos;t find a clear face in your photo, so these matches may be off. Try a front-facing photo.
                      </p>
                    </div>
                  )}
                  {Object.keys(results).length > 1 && (
                    <ModeMenu modes={Object.keys(results)} value={activeMode} onChange={setActiveMode} />
                  )}
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">
                    Top {matches.length} Matches
                  </p>
                  {matches.map((match, i) => (
                    <motion.div
                      key={i}
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
                        aria-label={`View ${match.name} full size`}
                        className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 shrink-0 flex items-center justify-center border border-white/10 enabled:cursor-zoom-in enabled:hover:border-(--ollie-cyan)/50 transition-colors"
                      >
                        {match.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={match.image} alt={match.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={28} className="text-white/20" />
                        )}
                      </button>

                      {/* Name + bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-white text-sm font-semibold truncate">{match.name}</span>
                          <span className="text-(--ollie-cyan) text-xs font-bold ml-2 shrink-0">
                            {match.similarity.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(match.similarity, 100)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 + 0.2, ease: "easeOut" }}
                            className="h-full rounded-full bg-(--ollie-cyan)"
                          />
                        </div>
                      </div>

                      {/* Rank badge */}
                      {i === 0 && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-(--ollie-cyan)/15 text-(--ollie-cyan) border border-(--ollie-cyan)/30">
                          #1
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <MatchInfo />

      {/* Full-size viewer */}
      {zoom?.image && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoom.name}
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/85 p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom.image} alt={zoom.name} className="w-[min(90vw,80vh)] aspect-square rounded-2xl object-cover" />
          <p className="text-white font-semibold">
            {zoom.name} <span className="text-(--ollie-cyan) ml-1">{zoom.similarity.toFixed(1)}%</span>
          </p>
        </div>
      )}
    </section>
  )
}
