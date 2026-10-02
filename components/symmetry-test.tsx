"use client"

// The hidden /face-symmetry-test tool. Everything runs in the browser: MediaPipe finds 478 face points, lib/symmetry.ts
// mirrors them and ranks the result against 3,000+ celebrity faces. The photo never leaves the device.
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { AlertCircle, ArrowRight, Loader2, RotateCcw, ScanFace } from "lucide-react"
import type { FaceLandmarker as FL } from "@mediapipe/tasks-vision"
import { Slot, shrink, type Photo } from "@/components/face-compare"
import { ShareResult } from "@/components/share-result"
import { PreviewCaption } from "@/components/result-preview"
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"
import { CompareSlider, CompareSliderAfter, CompareSliderBefore, CompareSliderHandle } from "@/components/ui/compare-slider"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { track } from "@/lib/analytics"
import { glass, glassOpen } from "@/lib/surfaces"
import { analyse, MAX_PITCH, MAX_YAW, NORMS_N, pose, REGION_LABEL, REGIONS, verdict, type SymmetryResult } from "@/lib/symmetry"

// Same files as the style scan (keep the version in step with package.json); loaded on the first test only (~15 MB).
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
const MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
const BLUE = "rgb(100 130 210)"
const faces = NORMS_N.toLocaleString("en-US")

// One landmarker per delegate. GPU first; some graphics drivers load the GPU model fine but then fail on a still photo
// (the error isn't even an Error), so run() retries the same photo on the CPU one.
const landmarkers: Partial<Record<"GPU" | "CPU", Promise<FL>>> = {}
function getLandmarker(delegate: "GPU" | "CPU" = "GPU") {
  const p = landmarkers[delegate] ??= (async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision")
    const files = await FilesetResolver.forVisionTasks(WASM)
    const opts = (d: "GPU" | "CPU") => ({
      baseOptions: { modelAssetPath: MODEL, delegate: d },
      runningMode: "IMAGE" as const,
      numFaces: 1,
      outputFacialTransformationMatrixes: true,
    })
    return delegate === "CPU" ? FaceLandmarker.createFromOptions(files, opts("CPU"))
      : FaceLandmarker.createFromOptions(files, opts("GPU")).catch(() => FaceLandmarker.createFromOptions(files, opts("CPU")))
  })()
  p.catch(() => delete landmarkers[delegate]) // let a retry load it again
  return p
}

class ModelLoadError extends Error {}

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

type Views = { original: string; left: string; right: string }

// Square crop around the face, levelled so the eyes are horizontal, plus the two "one side mirrored" faces.
// "left"/"right" are as you look at the photo.
function mirrorViews(img: HTMLImageElement, lm: { x: number; y: number }[], roll: number): Views {
  const xs = lm.map((p) => p.x * img.width), ys = lm.map((p) => p.y * img.height)
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length, cy = ys.reduce((a, b) => a + b, 0) / ys.length
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 1.45
  const S = 640
  const k = S / span
  const level = document.createElement("canvas")
  level.width = level.height = S
  const g = level.getContext("2d")!
  g.fillStyle = "#000"
  g.fillRect(0, 0, S, S)
  g.translate(S / 2, S / 2)
  g.rotate(-roll)
  g.scale(k, k)
  g.drawImage(img, -cx, -cy)

  const half = (keepLeft: boolean) => {
    const c = document.createElement("canvas")
    c.width = c.height = S
    const x = c.getContext("2d")!
    const sx = keepLeft ? 0 : S / 2
    x.drawImage(level, sx, 0, S / 2, S, sx, 0, S / 2, S) // the kept half, in place
    x.translate(S, 0)
    x.scale(-1, 1)
    x.drawImage(level, sx, 0, S / 2, S, sx, 0, S / 2, S) // the same half, flipped onto the other side
    return c.toDataURL("image/jpeg", 0.9)
  }
  return { original: level.toDataURL("image/jpeg", 0.9), left: half(true), right: half(false) }
}

export function SymmetryTest() {
  const [photo, setPhoto] = useState<Photo>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<(SymmetryResult & { views: Views }) | null>(null)
  const [side, setSide] = useState<"left" | "right">("left")
  const resultRef = useRef<HTMLDivElement>(null)

  // Paste a photo from the clipboard, like the other tools
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = Array.from(e.clipboardData?.files ?? []).find((x) => x.type.startsWith("image/"))
      if (f) load(f)
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [])

  async function load(f: File) {
    setError(null)
    setResult(null)
    try {
      setPhoto(await shrink(f))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that image. Try a JPG or PNG.")
    }
  }

  async function run() {
    if (!photo) return
    setLoading(true)
    setError(null)
    try {
      // the 1280px copy, not the original: a 12-48 MP phone photo can be bigger than the GPU's largest texture
      const img = await loadImg(photo.data)
      const lm = await getLandmarker().catch((e) => { throw new ModelLoadError(String(e)) })
      let res
      try {
        res = lm.detect(img)
      } catch (e) {
        console.warn("symmetry: GPU detect failed, retrying on the CPU", e)
        res = (await getLandmarker("CPU").catch((e2) => { throw new ModelLoadError(String(e2)) })).detect(img)
      }
      const pts = res.faceLandmarks[0]
      if (!pts) throw new Error("We couldn't find a face. Try a clear, front-facing photo.")
      const m = res.facialTransformationMatrixes?.[0]?.data
      const { yaw, pitch } = m ? pose(Array.from(m)) : { yaw: 0, pitch: 0 }
      if (Math.abs(yaw) > MAX_YAW || Math.abs(pitch) > MAX_PITCH) {
        throw new Error(`Your head is turned ${Math.round(Math.max(Math.abs(yaw), Math.abs(pitch)))}° from straight on, which would skew the score. Use a photo looking straight at the camera.`)
      }
      const r = analyse(pts, img.width, img.height)
      setResult({ ...r, views: mirrorViews(img, pts, r.roll) })
      track("symmetry_done", { beats: r.beats })
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }))
    } catch (e) {
      console.error("symmetry test failed", e)
      setError(e instanceof ModelLoadError ? "Something went wrong loading the face model. Check your connection and try again."
        : e instanceof Error ? e.message : "Couldn't analyse that photo. Try another clear, front-facing photo.")
      track("symmetry_error", { kind: e instanceof ModelLoadError ? "model" : e instanceof Error ? "photo" : "detect" })
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setPhoto(null)
    setResult(null)
    setError(null)
  }

  return (
    <section className="flex min-h-svh flex-col px-6 pt-[clamp(5rem,11svh,7rem)] pb-[clamp(1rem,4svh,3rem)]">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <div className="mb-[clamp(0.75rem,3svh,1.75rem)] text-center">
          <h1 className="fluid-h1-sm font-black text-white tracking-[-0.015em] leading-[1.05] text-balance">Face Symmetry Test</h1>
          <p className="mt-3 text-white/70 text-base leading-relaxed text-pretty">
            How symmetric is your face? Upload a straight-on photo and see how you compare with {faces} real faces.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:min-h-[clamp(24rem,calc(100svh-19.5rem),54rem)] md:grid-cols-2 md:items-stretch">
          <div className={`${glassOpen} flex flex-col gap-4 p-5 md:p-6 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-backwards motion-reduce:animate-none`}>
            <Slot photo={photo} label="Your photo" onFile={load} onClear={reset} />
            <button
              type="button"
              onClick={run}
              disabled={!photo || loading}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                photo && !loading ? "bg-(--ollie-cyan) text-black hover:opacity-90 active:scale-[0.98]" : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ScanFace size={16} aria-hidden="true" />}
              {loading ? "Measuring…" : "Test my symmetry"}
            </button>
            <p className="text-center text-xs text-white/50">
              Runs entirely on your device. Your photo is never uploaded.{" "}
              <Link href="/privacy" className="underline decoration-white/20 underline-offset-2 hover:text-white/60">Privacy</Link>
            </p>
          </div>

          <div
            ref={resultRef}
            className={`${glass} flex flex-col justify-center p-5 md:p-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-backwards motion-reduce:animate-none`}
            style={{ minHeight: "clamp(16rem, 40svh, 24rem)" }}
            aria-live="polite"
            aria-busy={loading}
          >
            {!loading && !result && !error && (
              <div className="flex flex-col items-center gap-5 opacity-70" aria-hidden="true">
                <PreviewCaption title="Your result will appear here" sub="A symmetry score, your face mirrored both ways, and a breakdown by feature" />
                <div className="flex items-center gap-4">
                  <Skeleton className="animate-none bg-white/[0.06] size-28 rounded-full" />
                  <Skeleton className="animate-none bg-white/[0.06] size-28 rounded-xl" />
                </div>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center gap-3 text-white/70">
                <Loader2 size={28} className="animate-spin text-(--ollie-cyan)" aria-hidden="true" />
                <p className="text-base font-medium">Finding 478 points on your face…</p>
                <p className="text-xs text-white/50">The first test loads the face model, which takes a few seconds.</p>
              </div>
            )}
            {error && !loading && (
              <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-red-300 text-sm leading-relaxed">{error}</p>
              </div>
            )}
            {result && !loading && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-5">
                <div className="flex items-center gap-5">
                  <AnimatedCircularProgressBar
                    value={result.beats}
                    gaugePrimaryColor={BLUE}
                    gaugeSecondaryColor="rgb(255 255 255 / 0.1)"
                    className="size-28 shrink-0 text-white"
                    label={<span className="text-3xl font-black tabular-nums">{result.beats}</span>}
                  />
                  <div>
                    <p className="text-2xl font-black text-white tracking-tight">{verdict(result.beats)}</p>
                    <p className="mt-1 text-sm text-white/70 leading-relaxed">
                      More symmetric than {result.beats}% of {faces} straight-on celebrity photos.
                    </p>
                  </div>
                </div>

                <div>
                  <SegmentedControl
                    label="Which side to mirror"
                    options={[{ value: "left", label: "Left side × 2" }, { value: "right", label: "Right side × 2" }]}
                    value={side}
                    onValueChange={(v) => setSide(v as "left" | "right")}
                    className="mb-3"
                  />
                  <CompareSlider defaultValue={50} className="aspect-square rounded-2xl border border-white/10" aria-label="Drag to compare your photo with the mirrored face">
                    <CompareSliderBefore label="Mirrored">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.views[side]} alt={`Your face with the ${side} side mirrored`} className="size-full object-cover" draggable={false} />
                    </CompareSliderBefore>
                    <CompareSliderAfter label="You">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.views.original} alt="Your photo, levelled" className="size-full object-cover" draggable={false} />
                    </CompareSliderAfter>
                    <CompareSliderHandle />
                  </CompareSlider>
                </div>

                <ul className="space-y-2.5">
                  {REGIONS.map((r) => (
                    <li key={r}>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80">{REGION_LABEL[r]}</span>
                        <span className="text-white/60 tabular-nums">more symmetric than {result.regions[r]}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
                        <motion.div className="h-full rounded-full bg-(--ollie-cyan)" initial={{ width: 0 }} animate={{ width: `${result.regions[r]}%` }} transition={{ duration: 0.8 }} />
                      </div>
                    </li>
                  ))}
                </ul>

                <ShareResult
                  card={{
                    intro: "How symmetric is my face?",
                    photos: [{ src: result.views.original, label: "Me" }, { src: result.views[side], label: `${side === "left" ? "Left" : "Right"} side × 2` }],
                    headline: `Beats ${result.beats}% of faces`,
                    subline: verdict(result.beats),
                    path: "face-symmetry-test",
                    text: `My face is more symmetric than ${result.beats}% of faces. Test yours:`,
                  }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href="/ai-stylist"
                    onClick={() => track("symmetry_cta", { to: "ai-stylist" })}
                    className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Find your face shape <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform motion-reduce:transition-none" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/celebrity-lookalike"
                    onClick={() => track("symmetry_cta", { to: "celebrity-lookalike" })}
                    className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Which celebrity do you look like? <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform motion-reduce:transition-none" aria-hidden="true" />
                  </Link>
                </div>
                <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white/70 hover:text-white">
                  <RotateCcw size={14} aria-hidden="true" />
                  Test another photo
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
