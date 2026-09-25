"use client"

// TextEffect, after motion-primitives. Changes from the original:
// - `inView`: play when scrolled into view instead of on mount, and reverse when scrolled out, so it replays. The text is always rendered, so it's in the
//   server HTML for search engines, and nothing jumps when it appears.
// - Screen readers get the whole string once (sr-only); the per-word/char copies are aria-hidden.
// - Reduced motion: plain text.
import { motion, useReducedMotion, type TargetAndTransition, type Variants } from "framer-motion"
import React from "react"
import { cn } from "@/lib/utils"

type PresetType = "blur" | "fade" | "slide" | "scale"
type Per = "word" | "char" | "line"

type TextEffectProps = {
  children: string
  per?: Per
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div"
  variants?: { container?: Variants; item?: Variants }
  className?: string
  preset?: PresetType
  delay?: number
  inView?: boolean
}

const STAGGER: Record<Per, number> = { char: 0.03, word: 0.06, line: 0.1 }

const container: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } }

const PRESETS: Record<PresetType, Variants> = {
  blur: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 6 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.5 } },
  },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slide: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
  scale: { hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } },
}

export function TextEffect({
  children,
  per = "word",
  as = "p",
  variants,
  className,
  preset = "fade",
  delay = 0,
  inView = false,
}: TextEffectProps) {
  const reduced = useReducedMotion()
  const Tag = as

  if (reduced) return <Tag className={className}>{children}</Tag>

  const segments = per === "line" ? children.split("\n") : per === "word" ? children.split(/(\s+)/) : children.split("")
  const item = variants?.item ?? PRESETS[preset]
  const base = variants?.container ?? container
  const containerVariants: Variants = {
    ...base,
    visible: {
      ...(base.visible as TargetAndTransition),
      transition: {
        ...(base.visible as TargetAndTransition)?.transition,
        staggerChildren: STAGGER[per],
        delayChildren: delay,
      },
    },
  }
  const play = inView
    ? { whileInView: "visible", viewport: { once: false, amount: 0.6 } }
    : { animate: "visible" }

  return (
    <Tag className={cn("whitespace-pre-wrap", className)}>
      <span className="sr-only">{children}</span>
      <motion.span initial="hidden" {...play} variants={containerVariants} aria-hidden="true">
        {segments.map((segment, i) => (
          <motion.span key={i} variants={item} className={per === "line" ? "block" : "inline-block whitespace-pre"}>
            {segment}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  )
}
