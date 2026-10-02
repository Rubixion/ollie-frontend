"use client"

import Link from "next/link"
import { track } from "@/lib/analytics"

// A Link that also sends a GA4 event, so server-rendered pages can measure their funnel clicks
export function TrackedLink({ event, params, ...props }: React.ComponentProps<typeof Link> & { event: string; params?: Record<string, string> }) {
  return <Link {...props} onClick={(e) => { track(event, params); props.onClick?.(e) }} />
}
