"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps, MouseEvent } from "react"

// A Link that glides back to the top when you're already on its page. Next.js does nothing for a link to the page
// you're on, so without this a click on "Contact" while on /contact looks broken. Modified clicks (new tab etc.) and
// links to other pages behave as normal.
export function PageLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || href !== pathname) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    })
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
