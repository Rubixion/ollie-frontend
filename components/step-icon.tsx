"use client"

import { useEffect, useRef } from "react"
import { UploadIcon, type UploadIconHandle } from "@/components/ui/upload-icon"
import { FaceIdIcon } from "@/components/ui/face-id-icon"
import { List3Icon } from "@/components/ui/list-3-icon"

const ICONS = [UploadIcon, FaceIdIcon, List3Icon]

// Each icon plays once, the first time the steps scroll into view (in turn: upload → read → match),
// and again when the card is hovered. No loop.
const STAGGER_MS = 350

export function StepIcon({ index }: { index: number }) {
  const ref = useRef<UploadIconHandle>(null)
  const box = useRef<HTMLSpanElement>(null)
  const Icon = ICONS[index]

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        timer = setTimeout(() => ref.current?.startAnimation(), 200 + index * STAGGER_MS)
      },
      { threshold: 1 }
    )
    if (box.current) io.observe(box.current)
    // Hovering anywhere on the step's card replays the icon, not just the icon itself
    const card = box.current?.closest("li")
    const replay = () => ref.current?.startAnimation()
    card?.addEventListener("mouseenter", replay)
    return () => {
      io.disconnect()
      clearTimeout(timer)
      card?.removeEventListener("mouseenter", replay)
    }
  }, [index])

  return (
    <span ref={box} className="inline-flex">
      <Icon ref={ref} size={30} className="text-(--ollie-cyan)" aria-hidden="true" />
    </span>
  )
}
