"use client"

import { useState } from "react"
import { ArrowRight, Loader2, ScanFace } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StyleScanner, type ScanResult } from "@/components/style-scanner"
import { StyleQuiz } from "@/components/style-quiz"
import { StyleEditor } from "@/components/style-editor"
import { glassOpen } from "@/lib/surfaces"
import { SHAPE_INFO, classify, type ShapeResult } from "@/lib/style/face-shape"
import type { Answers } from "@/lib/style/recommend"
import { track } from "@/lib/analytics"

type Scan = { age?: number; gender?: "male" | "female"; pending: boolean }

export function StyleAdvisor() {
  const [step, setStep] = useState<"scan" | "result" | "quiz" | "report">("scan")
  const [shape, setShape] = useState<ShapeResult>()
  const [scan, setScan] = useState<Scan>({ pending: false })
  const [answers, setAnswers] = useState<Answers>()
  const [photo, setPhoto] = useState<string>()

  function scanned({ ratios, frame }: ScanResult) {
    const s = classify(ratios)
    setShape(s)
    setPhoto(frame)
    setStep("result")
    track("style_scan_done", { shape: s.shape })
    // the age estimate is a nice-to-have: the flow carries on if it fails
    setScan({ pending: true })
    fetch("/api/style-scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: frame }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setScan({ pending: false, age: d?.face_found ? d.age : undefined, gender: d?.gender ?? undefined }))
      .catch(() => setScan({ pending: false }))
  }

  const panel = `${glassOpen} mx-auto w-full max-w-xl p-5 md:p-6 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-backwards motion-reduce:animate-none`

  if (step === "scan") return <div className={panel}><StyleScanner onDone={scanned} /></div>

  if (step === "result" && shape) return (
    <div className={`${panel} flex flex-col gap-5`} aria-live="polite">
      <div className="text-center">
        <p className="text-sm font-semibold text-white/70">Your face shape</p>
        <p className="text-5xl font-black capitalize tracking-tight text-(--ollie-cyan)">{shape.shape}</p>
        {shape.confidence < 0.55 && <p className="mt-1 text-sm text-white/60">Close to {shape.second}</p>}
      </div>
      <p className="text-base leading-relaxed text-white/70 text-pretty">{SHAPE_INFO[shape.shape]}</p>
      <p className="flex items-center gap-2 text-sm text-white/60">
        {scan.pending ? <><Loader2 size={14} className="animate-spin" aria-hidden="true" />Estimating your age…</>
          : scan.age !== undefined ? `The scan reads you as about ${scan.age}.` : null}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="brandOutline" size="cta" onClick={() => setStep("scan")} className="gap-2 sm:flex-1"><ScanFace size={16} aria-hidden="true" />Rescan</Button>
        <Button variant="brand" size="cta" onClick={() => setStep("quiz")} className="gap-2 sm:flex-1">Continue<ArrowRight size={16} aria-hidden="true" /></Button>
      </div>
    </div>
  )

  if (step === "quiz") return (
    <div className={panel}>
      <StyleQuiz scanAge={scan.age} scanGender={scan.gender} onDone={(a) => { setAnswers(a); setStep("report"); track("style_quiz_done"); window.scrollTo({ top: 0 }) }} />
    </div>
  )

  if (step === "report" && shape && answers && photo) return (
    <div className="mx-auto w-full max-w-6xl">
      <StyleEditor photo={photo} shape={shape} answers={answers} onRescan={() => setStep("scan")} onRetake={() => setStep("quiz")} />
    </div>
  )

  return null
}
