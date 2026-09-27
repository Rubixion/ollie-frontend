"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScanFaceIcon, type ScanFaceIconHandle } from "@/components/ui/scan-face-icon"
import { UsersIcon, type UsersIconHandle } from "@/components/ui/users-icon"

const arrow = "-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"

// Match and Compare buttons for the /search coming-soon page. The icons play once as the buttons fade in
// (ComingSoon02 shows its actions ~1s after load), then only when the button is hovered or focused.
export function TryTools() {
  const scan = useRef<ScanFaceIconHandle>(null)
  const users = useRef<UsersIconHandle>(null)

  useEffect(() => {
    const t = window.setTimeout(() => {
      scan.current?.stopAnimation() // "appear": its corners spring in around the face, one by one
      users.current?.startAnimation()
    }, 1100)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <Button asChild variant="brand" size="cta" className="group flex-1">
        <Link href="/match" onMouseEnter={() => scan.current?.startAnimation()} onFocus={() => scan.current?.startAnimation()}>
          <ScanFaceIcon ref={scan} appear size={18} className="-ms-1 me-2" aria-hidden="true" />
          Match
          <ArrowRight className={arrow} size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </Button>
      <Button asChild variant="brandOutline" size="cta" className="group flex-1">
        <Link
          href="/compare"
          onMouseEnter={() => users.current?.startAnimation()}
          onFocus={() => users.current?.startAnimation()}
          onMouseLeave={() => users.current?.stopAnimation()}
        >
          <UsersIcon ref={users} size={18} className="-ms-1 me-2" aria-hidden="true" />
          Compare
          <ArrowRight className={arrow} size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}
