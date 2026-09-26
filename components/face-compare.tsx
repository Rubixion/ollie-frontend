"use client"

// The hidden /compare page: two photos in, "same person or not" plus a lookalike percentage out.
import { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Upload, X, Users, Loader2, AlertCircle, User, RotateCcw } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { scale } from "@/components/celebrity-finder"
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader"
import { ShareResult } from "@/components/share-result"
import { glass, glassOpen } from "@/lib/surfaces"

// ponytail: raw server score at or above this = same person. Same-person photos land ~47+, strangers ~40
// (see scale() in celebrity-finder); tune here if it calls twins "same" or misses real matches.
const SAME_RAW = 45

const PHASES = [
  { at: 0, label: "Uploading your photos…" },
  { at: 28, label: "Finding the faces…" },
  { at: 63, label: "Comparing…" },
  { at: 95, label: "Still working…" },
]

type Photo = { data: string; preview: string } | null

// Same shrink-to-1280px JPEG as the match page
function shrink(file: File): Promise<{ data: string; preview: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Please upload an image file."))
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const s = Math.min(1, 1280 / Math.max(img.width, img.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(img.width * s)
        canvas.height = Math.round(img.height * s)
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "#fff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        resolve({ data: canvas.toDataURL("image/jpeg", 0.9), preview: img.src })
      }
      img.onerror = () => reject(new Error("Couldn't read that image. Try a JPG or PNG."))
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

function Slot({ photo, label, onFile, onClear }: { photo: Photo; label: string; onFile: (f: File) => void; onClear: () => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragProps = {
    onDragOver: (e: DragEvent<HTMLElement>) => { e.preventDefault(); setIsDragging(true) },
    onDragLeave: () => setIsDragging(false),
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) onFile(file)
    },
  }
  const zone = `relative flex flex-1 items-center justify-center rounded-2xl border border-dashed transition-colors has-focus-visible:ring-2 has-focus-visible:ring-(--ollie-cyan)
    ${isDragging ? "border-(--ollie-cyan)/40 bg-(--ollie-glow)" : photo ? "border-white/10 bg-white/[0.02]" : "border-white/15 hover:border-white/30 hover:bg-white/[0.03] cursor-pointer"}`

  return photo ? (
    <div {...dragProps} className={zone} style={{ minHeight: "clamp(8rem, 20svh, 13rem)" }}>
      <div className="relative p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.preview} alt={`${label}, uploaded`} className="max-w-full max-h-[min(14rem,28svh)] rounded-xl object-contain" />
        <button
          type="button"
          onClick={() => { onClear(); if (inputRef.current) inputRef.current.value = "" }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 border border-white/10 text-white hover:bg-black/90"
          aria-label={`Remove ${label.toLowerCase()}`}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  ) : (
    <label {...dragProps} className={zone} style={{ minHeight: "clamp(8rem, 20svh, 13rem)" }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
      />
      <span className="flex flex-col items-center gap-2 p-6 text-center">
        <Upload size={22} className={isDragging ? "text-(--ollie-cyan)" : "text-white/50"} aria-hidden="true" />
        <span className="text-sm font-medium text-white/80">{label}</span>
        <span className="text-xs text-white/50">Click, drop or paste</span>
      </span>
    </label>
  )
}

export function FaceCompare() {
  const { openModal } = useAuth()
  const [photos, setPhotos] = useState<[Photo, Photo]>([null, null])
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<{ score: number; same: boolean; facesFound: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) return
    const t0 = Date.now()
    const id = setInterval(() => setElapsed((Date.now() - t0) / 1000), 250)
    return () => clearInterval(id)
  }, [loading])

  const setPhoto = useCallback((i: 0 | 1, p: Photo) => {
    setPhotos((ps) => (i === 0 ? [p, ps[1]] : [ps[0], p]))
    setResult(null)
    setError(null)
  }, [])

  const loadFile = useCallback((i: 0 | 1, file: File) => {
    shrink(file).then((p) => setPhoto(i, p), (e: Error) => setError(e.message))
  }, [setPhoto])

  // Paste fills the first empty slot (the second one once both are full)
  const firstFilled = Boolean(photos[0])
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"))
      if (file) {
        e.preventDefault()
        loadFile(firstFilled ? 1 : 0, file)
      }
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [loadFile, firstFilled])

  const reset = () => {
    setPhotos([null, null])
    setResult(null)
    setError(null)
  }

  const ready = Boolean(photos[0] && photos[1])

  const compare = async () => {
    if (!photos[0] || !photos[1]) return
    setElapsed(0)
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ image: photos[0].data, image2: photos[1].data, compare: true }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.code === "guest_limit") openModal(() => compare())
        throw new Error(json.error || "Compare failed")
      }
      setResult({
        score: scale(json.score),
        same: json.score >= SAME_RAW,
        facesFound: Array.isArray(json.face_found) && json.face_found.every(Boolean),
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex min-h-svh flex-col px-6 pt-[clamp(5rem,11svh,7rem)] pb-[clamp(1rem,4svh,3rem)]">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <div className="mb-[clamp(0.75rem,3svh,1.75rem)] text-center">
          <h1 className="fluid-h1-sm font-black text-white tracking-[-0.015em] leading-[1.05] text-balance">Same Person?</h1>
          <p className="mt-3 text-white/70 text-base leading-relaxed text-pretty">Upload two photos to see if they&apos;re the same person, and how alike they look.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:min-h-[clamp(26rem,calc(100svh-17rem),54rem)] md:grid-cols-2 md:items-stretch">
          <div className={`${glassOpen} flex flex-col gap-4 p-5 md:p-6`}>
            <Slot photo={photos[0]} label="First photo" onFile={(f) => loadFile(0, f)} onClear={() => setPhoto(0, null)} />
            <Slot photo={photos[1]} label="Second photo" onFile={(f) => loadFile(1, f)} onClear={() => setPhoto(1, null)} />

            <button
              type="button"
              onClick={compare}
              disabled={!ready || loading}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                ready && !loading ? "bg-(--ollie-cyan) text-black hover:opacity-90 active:scale-[0.98]" : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Users size={16} aria-hidden="true" />}
              {loading ? "Comparing…" : "Compare faces"}
            </button>
            <p className="text-center text-xs text-white/50">
              Your photos are only used for this comparison and are never stored.{" "}
              <Link href="/privacy" className="underline decoration-white/20 underline-offset-2 hover:text-white/60">Privacy</Link>
            </p>
          </div>

          <div className={`${glass} flex flex-col justify-center p-5 md:p-6`} style={{ minHeight: "clamp(16rem, 40svh, 24rem)" }} aria-live="polite" aria-busy={loading}>
            {!loading && !result && !error && (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <User size={32} className="text-white/25" aria-hidden="true" />
                <p className="text-white/70 font-medium">The result will appear here</p>
              </div>
            )}
            {loading && (
              <ProgressiveFluxLoader
                value={Math.min(95, 100 * (1 - Math.exp(-elapsed / 6)))}
                phases={PHASES}
                className="gap-3 px-2 [--flux-from:var(--ollie-purple)] [--flux-to:var(--ollie-cyan)]"
                barClassName="h-2 bg-white/10 shadow-none"
                textClassName="text-base sm:text-lg font-medium text-white/70"
              />
            )}
            {error && !loading && (
              <div role="alert" className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-red-300 text-sm leading-relaxed">{error}</p>
              </div>
            )}
            {result && !loading && photos[0] && photos[1] && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4">
                {!result.facesFound && (
                  <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-xs">
                    We couldn&apos;t find a clear face in one of the photos, so this may be off. Try front-facing photos.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((p, i) => (
                    <figure key={i}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p!.preview} alt={i === 0 ? "First photo" : "Second photo"} className="aspect-square w-full rounded-xl object-cover border border-white/10" />
                      <figcaption className="mt-1.5 text-xs text-white/60">{i === 0 ? "Photo 1" : "Photo 2"}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-white tracking-tight">{result.same ? "Same person" : "Different people"}</p>
                  <p className="mt-2 text-white/70 text-sm font-semibold">Lookalike</p>
                  <p className="text-6xl font-black text-(--ollie-cyan) tabular-nums tracking-tight">{result.score.toFixed(1)}%</p>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-linear-to-r from-(--ollie-purple) to-(--ollie-cyan)"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <ShareResult
                  card={{
                    intro: "Same person?",
                    photos: [{ src: photos[0].preview, label: "Photo 1" }, { src: photos[1].preview, label: "Photo 2" }],
                    headline: result.same ? "Same person" : "Different people",
                    subline: `${result.score.toFixed(1)}% lookalike`,
                    path: "compare",
                    text: `${result.same ? "Same person" : "Different people"}, ${result.score.toFixed(1)}% lookalike. Compare two faces:`,
                  }}
                />
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Compare other photos
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
