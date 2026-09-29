"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, ScanFace } from "lucide-react"
import type { FaceLandmarker as FL } from "@mediapipe/tasks-vision"
import { Button } from "@/components/ui/button"
import { ShineBorder } from "@/components/ui/shine-border"
import { average, measure, type Ratios } from "@/lib/style/face-shape"

// Keep the version in step with package.json. Files load only after "Start scan" (they're ~15 MB).
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
const MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
const NEED = 30 // straight-on frames to average
// degrees. The norms use 10 (celeb_v2/face_norms.py); 15 is kinder to laptop webcams that sit above eye level.
const MAX_TILT = 15
const BLUE = "rgb(100 130 210)"

export type ScanResult = { ratios: Ratios; frame: string }

export function StyleScanner({ onDone }: { onDone: (r: ScanResult) => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const stopRef = useRef<() => void>(() => {})
  const [phase, setPhase] = useState<"idle" | "loading" | "scanning">("idle")
  const [hint, setHint] = useState("")
  const [count, setCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => () => stopRef.current(), [])

  async function start() {
    setError(null)
    setPhase("loading")
    let stream: MediaStream | undefined
    let lm: FL | undefined
    let raf = 0
    const stop = () => {
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
      lm?.close()
      lm = undefined
    }
    stopRef.current = stop
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      const v = video.current!
      v.srcObject = stream
      await v.play()
      const { FaceLandmarker, FilesetResolver, DrawingUtils } = await import("@mediapipe/tasks-vision")
      const files = await FilesetResolver.forVisionTasks(WASM)
      const opts = (delegate: "GPU" | "CPU") => ({
        baseOptions: { modelAssetPath: MODEL, delegate },
        runningMode: "VIDEO" as const,
        numFaces: 1,
        outputFacialTransformationMatrixes: true,
        outputFaceBlendshapes: true, // to skip frames where you're smiling or talking
      })
      lm = await FaceLandmarker.createFromOptions(files, opts("GPU")).catch(() => FaceLandmarker.createFromOptions(files, opts("CPU")))

      const c = canvas.current!
      const ctx = c.getContext("2d")!
      const draw = new DrawingUtils(ctx)
      const samples: Ratios[] = []
      let last = -1
      setCount(0)
      setPhase("scanning")

      const tick = () => {
        if (!lm) return
        raf = requestAnimationFrame(tick)
        if (v.currentTime === last) return
        last = v.currentTime
        const w = v.videoWidth, h = v.videoHeight
        if (c.width !== w) { c.width = w; c.height = h }
        const res = lm.detectForVideo(v, performance.now())
        ctx.clearRect(0, 0, w, h)
        const pts = res.faceLandmarks[0]
        if (!pts) return setHint("Put your face in the frame")

        draw.drawConnectors(pts, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "rgb(100 130 210 / 0.35)", lineWidth: 0.6 })
        draw.drawConnectors(pts, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: BLUE, lineWidth: 2.5 })
        draw.drawLandmarks([234, 454, 10, 152, 21, 251, 58, 288, 150, 379].map((i) => pts[i]), { color: "#fff", fillColor: BLUE, radius: 3, lineWidth: 1 })

        const m = res.facialTransformationMatrixes[0]?.data // 4x4, column-major
        const yaw = m ? Math.abs((Math.atan2(m[8], m[10]) * 180) / Math.PI) : 90
        const pitch = m ? Math.abs((Math.atan2(-m[9], Math.hypot(m[8], m[10])) * 180) / Math.PI) : 90
        const faceWidth = Math.abs(pts[454].x - pts[234].x)
        if (faceWidth < 0.18) return setHint("Move a little closer")
        if (yaw > MAX_TILT || pitch > MAX_TILT) return setHint("Look straight at the camera, level with your eyes")
        const face = Object.fromEntries((res.faceBlendshapes[0]?.categories ?? []).map((b) => [b.categoryName, b.score]))
        if ((face.mouthSmileLeft ?? 0) + (face.mouthSmileRight ?? 0) > 0.7 || (face.jawOpen ?? 0) > 0.3) return setHint("Relax your face, mouth closed")

        setHint("Hold still")
        samples.push(measure(pts, w, h))
        setCount(samples.length)
        if (samples.length < NEED) return

        // one still frame (age estimate + the editor's try-on photo), then the camera goes off
        const still = document.createElement("canvas")
        const s = Math.min(1, 1024 / w)
        still.width = w * s
        still.height = h * s
        still.getContext("2d")!.drawImage(v, 0, 0, still.width, still.height)
        const frame = still.toDataURL("image/jpeg", 0.9)
        stop()
        setPhase("idle")
        onDone({ ratios: average(samples), frame })
      }
      tick()
    } catch (e) {
      stop()
      setPhase("idle")
      const name = (e as Error)?.name
      setError(
        name === "NotAllowedError" ? "Camera access is blocked. Allow the camera for this site in your browser settings, then try again."
        : name === "NotFoundError" ? "No camera found on this device."
        : "The scanner couldn't start. Check your connection and try again.",
      )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ShineBorder className="aspect-[4/3] w-full" duration={phase === "scanning" ? 2 : 4}>
        {/* mirrored like a selfie camera; the canvas sits exactly over the video */}
        <video ref={video} playsInline muted className="absolute inset-0 size-full -scale-x-100 object-cover" aria-hidden="true" />
        <canvas ref={canvas} className="absolute inset-0 size-full -scale-x-100 object-cover" aria-hidden="true" />
        {phase !== "scanning" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            {phase === "loading" ? (
              <>
                <Loader2 size={24} className="animate-spin text-(--ollie-cyan)" aria-hidden="true" />
                <p className="text-sm text-white/70">Starting the scanner…</p>
              </>
            ) : (
              <>
                <ScanFace size={28} className="text-(--ollie-cyan)" aria-hidden="true" />
                <p className="max-w-xs text-sm text-white/70 text-pretty">Hold the camera at eye level in good light, with a relaxed face and your hair off your forehead if you can. The scan runs on your device.</p>
              </>
            )}
          </div>
        )}
      </ShineBorder>

      {phase === "scanning" ? (
        <div aria-live="polite">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-white">{hint}</span>
            <span className="text-white/60 tabular-nums">{Math.round((count / NEED) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-(--ollie-cyan) transition-[width]" style={{ width: `${(count / NEED) * 100}%` }} />
          </div>
        </div>
      ) : (
        <Button variant="brand" size="cta" onClick={start} disabled={phase === "loading"} className="w-full gap-2">
          <ScanFace size={16} aria-hidden="true" />
          Start scan
        </Button>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}
