"use client"

import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react"
import { MotionConfig, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface InfoTab {
  id: string // also the id of the heading inside the panel, so /match#faq opens the FAQ tab
  label: string
  content: ReactNode
}

// Tabs for the "good to know" section under the finder. Every panel is in the server HTML (the inactive ones just
// have `hidden`), so crawlers and AI answer engines still read all of it. With JavaScript off the tabs can't be
// clicked, so the <noscript> style below shows every panel instead.
export function InfoTabs({ tabs, panelClassName }: { tabs: InfoTab[]; panelClassName?: string }) {
  const [active, setActive] = useState(tabs[0].id)

  // Links like /match#how or /match#faq open the matching tab. The timeout keeps setState out of the effect body.
  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!tabs.some((t) => t.id === id)) return
      setActive(id)
      requestAnimationFrame(() => document.getElementById("info")?.scrollIntoView({ block: "start" }))
    }
    const first = window.setTimeout(openFromHash, 0)
    window.addEventListener("hashchange", openFromHash)
    return () => {
      window.clearTimeout(first)
      window.removeEventListener("hashchange", openFromHash)
    }
  }, [tabs])

  // Arrow keys move between tabs (roving tabindex, as in the WAI-ARIA tabs pattern)
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === active)
    const n = tabs.length
    const next =
      e.key === "ArrowRight" ? (i + 1) % n
      : e.key === "ArrowLeft" ? (i - 1 + n) % n
      : e.key === "Home" ? 0
      : e.key === "End" ? n - 1
      : -1
    if (next < 0) return
    e.preventDefault()
    setActive(tabs[next].id)
    document.getElementById(`tab-${tabs[next].id}`)?.focus()
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="tablist"
        aria-label="About Ollie"
        onKeyDown={onKeyDown}
        className="mx-auto mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-white/[0.04] p-1 sm:flex sm:flex-wrap sm:justify-center"
      >
        {tabs.map((t) => {
          const selected = t.id === active
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              className={cn(
                "relative min-h-10 rounded-xl px-2 text-[13px] font-semibold sm:px-4 sm:text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)",
                selected ? "text-white" : "text-white/60 hover:text-white",
              )}
            >
              {selected && (
                <motion.span
                  layoutId="info-tab"
                  className="absolute inset-0 rounded-xl bg-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          )
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={t.id !== active}
          className={cn("tab-panel", panelClassName)}
        >
          {t.content}
        </div>
      ))}
      <noscript>
        <style>{".tab-panel[hidden]{display:block!important;margin-top:1rem}"}</style>
      </noscript>
    </MotionConfig>
  )
}
