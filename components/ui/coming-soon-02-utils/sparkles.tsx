"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

// Twinkling, slowly rising dots on a canvas. Stands in for the tsParticles "sparkles" the Hirael block was built
// with, without the dependency. density = dots per 10,000 px². Drawn once, still, for prefers-reduced-motion.
export function Sparkles({
  density = 4,
  size = 1.4,
  color = "currentColor",
  className,
}: {
  density?: number
  size?: number
  color?: string // any CSS color, including var(--x)
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    canvas.style.color = color
    const fill = getComputedStyle(canvas).color // resolves var(--x) to a color the canvas understands
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let w = 0, h = 0, raf = 0
    let dots: { x: number; y: number; r: number; phase: number; speed: number; rise: number }[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dots = Array.from({ length: Math.round(((w * h) / 10_000) * density) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (0.4 + Math.random() * 0.6) * size,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        rise: 0.05 + Math.random() * 0.15,
      }))
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = fill
      for (const d of dots) {
        if (!still) {
          d.y -= d.rise
          if (d.y < 0) d.y = h
        }
        ctx.globalAlpha = still ? 0.7 : 0.25 + 0.75 * Math.abs(Math.sin(d.phase + (t / 1000) * d.speed))
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!still) raf = requestAnimationFrame(draw)
    }

    resize()
    if (still) draw(0)
    else raf = requestAnimationFrame(draw)
    const ro = new ResizeObserver(() => {
      resize()
      if (still) draw(0)
    })
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [density, size, color])

  return <canvas ref={ref} aria-hidden="true" className={cn("absolute inset-0 size-full", className)} />
}
