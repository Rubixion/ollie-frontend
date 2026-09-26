"use client"

// The hidden /kirk-meter page: the match page's uploader, scored against the server's kirk/ reference photos.
import { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Upload, X, Gauge, Loader2, AlertCircle, User, RotateCcw } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { scale } from "@/components/celebrity-finder"
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader"
import { glass, glassOpen } from "@/lib/surfaces"

const PHASES = [
  { at: 0, label: "Uploading your photo…" },
  { at: 28, label: "Finding your face…" },
  { at: 63, label: "Measuring the Kirk…" },
  { at: 95, label: "Still working…" },
]

export function KirkMeter() {
  const { openModal } = useAuth()
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<{ score: number; thumb: string; faceFound: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading) return
    const t0 = Date.now()
    const id = setInterval(() => setElapsed((Date.now() - t0) / 1000), 250)
    return () => clearInterval(id)
  }, [loading])

  // Same shrink-to-1280px JPEG as the match page
  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return setError("Please upload an image file.")
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
        setImageDataUrl(canvas.toDataURL("image/jpeg", 0.9))
        setPreviewUrl(img.src)
        setResult(null)
        setError(null)
      }
      img.onerror = () => setError("Couldn't read that image. Try a JPG or PNG.")
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [])

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

  const clearImage = () => {
    setImageDataUrl(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const measure = async () => {
    if (!imageDataUrl) return
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
        body: JSON.stringify({ image: imageDataUrl, kirk: true }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.code === "guest_limit") openModal(() => measure())
        throw new Error(json.error || "Search failed")
      }
      setResult({ score: scale(json.score), thumb: json.thumb, faceFound: Boolean(json.face_found) })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const dragProps = {
    onDragOver: (e: DragEvent<HTMLElement>) => { e.preventDefault(); setIsDragging(true) },
    onDragLeave: () => setIsDragging(false),
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) loadFile(file)
    },
  }
  const dropZone = `relative flex flex-1 items-center justify-center rounded-2xl border border-dashed transition-colors has-focus-visible:ring-2 has-focus-visible:ring-(--ollie-cyan)
    ${isDragging ? "border-(--ollie-cyan)/40 bg-(--ollie-glow)" : imageDataUrl ? "border-white/10 bg-white/[0.02]" : "border-white/15 hover:border-white/30 hover:bg-white/[0.03] cursor-pointer"}`

  return (
    <section className="flex min-h-svh flex-col px-6 pt-[clamp(5rem,11svh,7rem)] pb-[clamp(1rem,4svh,3rem)]">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <div className="mb-[clamp(0.75rem,3svh,1.75rem)] text-center">
          <h1 className="fluid-h1-sm font-black text-white tracking-[-0.015em] leading-[1.05] text-balance">The Kirk Meter</h1>
          <p className="mt-3 text-white/70 text-base leading-relaxed text-pretty">Upload a photo to see how Kirk you are.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:min-h-[clamp(26rem,calc(100svh-17rem),54rem)] md:grid-cols-2 md:items-stretch">
          <div className={`${glassOpen} flex flex-col gap-5 p-5 md:p-6`}>
            {imageDataUrl ? (
              <div {...dragProps} className={dropZone} style={{ minHeight: "clamp(9rem, 24svh, 15rem)" }}>
                <div className="relative p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl ?? imageDataUrl} alt="Your uploaded photo" className="max-w-full max-h-[min(20rem,40svh)] rounded-xl object-contain" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 border border-white/10 text-white hover:bg-black/90"
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <label {...dragProps} className={dropZone} style={{ minHeight: "clamp(9rem, 24svh, 15rem)" }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) loadFile(f) }}
                />
                <span className="flex flex-col items-center gap-3 p-8 text-center">
                  <Upload size={24} className={isDragging ? "text-(--ollie-cyan)" : "text-white/50"} aria-hidden="true" />
                  <span className="text-sm font-medium text-white/80">Click to upload or drop a photo</span>
                  <span className="text-xs text-white/50">You can also paste with Ctrl+V</span>
                </span>
              </label>
            )}

            <button
              type="button"
              onClick={measure}
              disabled={!imageDataUrl || loading}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                imageDataUrl && !loading ? "bg-(--ollie-cyan) text-black hover:opacity-90 active:scale-[0.98]" : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Gauge size={16} aria-hidden="true" />}
              {loading ? "Measuring…" : "Measure my Kirk"}
            </button>
            <p className="text-center text-xs text-white/50">
              Your photo is only used for this search and is never stored.{" "}
              <Link href="/privacy" className="underline decoration-white/20 underline-offset-2 hover:text-white/60">Privacy</Link>
            </p>
          </div>

          <div className={`${glass} flex flex-col justify-center p-5 md:p-6`} style={{ minHeight: "clamp(16rem, 40svh, 24rem)" }} aria-live="polite" aria-busy={loading}>
            {!loading && !result && !error && (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <User size={32} className="text-white/25" aria-hidden="true" />
                <p className="text-white/70 font-medium">Your Kirk score will appear here</p>
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
            {result && !loading && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4">
                {!result.faceFound && (
                  <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-xs">
                    We couldn&apos;t find a clear face in your photo, so this may be off. Try a front-facing photo.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl ?? imageDataUrl ?? ""} alt="Your photo" className="aspect-square w-full rounded-xl object-cover border border-white/10" />
                    <figcaption className="mt-1.5 text-xs text-white/60">You</figcaption>
                  </figure>
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.thumb} alt="Closest Kirk photo" className="aspect-square w-full rounded-xl object-cover border border-(--ollie-cyan)/40" />
                    <figcaption className="mt-1.5 text-xs text-white/60">Kirk</figcaption>
                  </figure>
                </div>
                <div className="text-center">
                  <p className="text-white/70 text-sm font-semibold">Kirk level</p>
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
                <button
                  type="button"
                  onClick={clearImage}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Try another photo
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
