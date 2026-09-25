"use client"

import { useEffect } from "react"

// Fades [data-reveal] elements up as they scroll into view (styles in globals.css). Once an element is fully
// below the viewport again (the user scrolled back up past it) it resets, so scrolling down replays it. Elements
// that leave through the top stay revealed, so scrolling up shows them already in place.
// Content is visible without JS: elements are only hidden after the "reveal-ready" class is set, and anything
// already on screen at that moment is marked revealed first, so nothing blinks.
export function RevealOnScroll() {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]")]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("revealed")
          else if (e.boundingClientRect.top > 0) e.target.classList.remove("revealed")
        }
      },
      { threshold: 0 }
    )
    for (const el of els) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("revealed")
      io.observe(el)
    }
    document.documentElement.classList.add("reveal-ready")
    return () => io.disconnect()
  }, [])
  return null
}
