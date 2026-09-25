"use client"

import type { ReactNode } from "react"

// Glides to a section on the same page without putting #id in the URL
export function ScrollButton({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => document.getElementById(to)?.scrollIntoView({ behavior: "smooth" })}>
      {children}
    </button>
  )
}
