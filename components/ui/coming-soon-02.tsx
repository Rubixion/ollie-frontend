// Coming Soon 2 from Hirael <https://hirael.com/blocks/not-found/coming-soon-02>
// MIT · Mohammad Shehadeh · https://github.com/MohammadShehadeh/hirael
// Adapted for Ollie: text comes in as props, Ollie's type and colors (--ollie-cyan) instead of Hirael's theme,
// and it animates on load like the other tool pages instead of on scroll.

"use client"

import { Fragment, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { Sparkles } from "@/components/ui/sparkles"

// Each word rising in turn (one color: the dimmed-first-half look read as template filler)
function Headline({ text }: { text: string }) {
  const reduce = useReducedMotion()
  const words = text.split(" ")

  return (
    <h1
      data-slot="coming-soon-title"
      className="max-w-2xl fluid-h1-sm font-black leading-[1.05] tracking-[-0.015em] text-balance"
    >
      {words.map((word, i) => (
        // The space sits outside the inline-block span, where it collapses to nothing
        <Fragment key={`${word}-${i}`}>
          <motion.span
            className="inline-block text-white"
            initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 + i * 0.08 }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h1>
  )
}

export default function ComingSoon02({
  badge = "Coming soon",
  headline,
  description,
  children,
}: {
  badge?: string
  headline: string
  description: ReactNode
  children?: ReactNode // actions under the description
}) {
  const reduce = useReducedMotion()

  return (
    <section
      data-slot="coming-soon"
      className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden pt-24 pb-40"
    >
      {/* The text stays still and sharp while scrolling; only the horizon behind it moves (data-parallax="horizon") */}
      <div className="relative z-10 w-full">
      <motion.div
        data-slot="coming-soon-body"
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-6 text-center md:px-10"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        >
          <Badge
            variant="outline"
            data-slot="coming-soon-badge"
            className="rounded-full border-(--ollie-cyan)/30 bg-(--ollie-cyan)/10 px-3.5 py-1 text-sm font-semibold text-(--ollie-cyan)"
          >
            {badge}
          </Badge>
        </motion.div>

        <Headline text={headline} />

        <motion.div
          data-slot="coming-soon-description"
          className="mt-2 max-w-2xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {description}
        </motion.div>

        {children && (
          <motion.div
            data-slot="coming-soon-actions"
            className="mt-4 flex w-full flex-col items-center gap-4"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            {children}
          </motion.div>
        )}
      </motion.div>
      </div>

      {/* Glowing horizon pinned to the bottom of the screen (so the page doesn't scroll into it): a huge ellipse
          whose top edge is the curve, with sparkles rising over it */}
      <div
        data-slot="coming-soon-horizon"
        data-parallax="horizon"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-96 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,black,transparent)] after:absolute after:-start-1/2 after:top-1/2 after:aspect-[1/0.7] after:w-[200%] after:rounded-[100%] after:border-t after:border-(--ollie-cyan)/40 after:bg-(--ollie-card) after:content-['']"
      >
        <div
          data-slot="coming-soon-horizon-glow"
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,color-mix(in_oklch,var(--ollie-cyan)_40%,transparent),transparent_70%)] opacity-60"
        />
        <Sparkles
          density={600}
          size={1.4}
          speed={0.6}
          color="rgb(100, 130, 210)" // --ollie-cyan; tsParticles needs a literal color, not var()
          className="absolute inset-0 size-full [mask-image:radial-gradient(50%_50%,black,transparent_85%)]"
        />
      </div>
    </section>
  )
}
