"use client"

import { useEffect, useImperativeHandle, useRef, type Ref, type SVGProps } from "react"

export interface List3IconHandle {
  startAnimation: () => void
}

type List3IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & { size?: number; ref?: Ref<List3IconHandle> }

// The draw-in is SMIL, so replaying means rewinding the svg's own timeline.
// SMIL ignores prefers-reduced-motion, so under it the icon is frozen at its drawn end state.
export function List3Icon({ size = 24, ref, ...props }: List3IconProps) {
  const svg = useRef<SVGSVGElement>(null)
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches

  useEffect(() => {
    if (!reduced()) return
    svg.current?.pauseAnimations()
    svg.current?.setCurrentTime(2)
  }, [])

  useImperativeHandle(ref, () => ({
    startAnimation: () => {
      if (!reduced()) svg.current?.setCurrentTime(0)
    },
  }))

  return (
    <svg ref={svg} width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><g strokeDasharray="28"><path d="M9.5 5c0 -0.83 0.67 -1.5 1.5 -1.5h8c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5h-8c-0.83 0 -1.5 -0.67 -1.5 -1.5Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="28;0" /></path><path strokeDashoffset="28" d="M9.5 12c0 -0.83 0.67 -1.5 1.5 -1.5h8c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5h-8c-0.83 0 -1.5 -0.67 -1.5 -1.5Z"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.4s" to="0" /></path><path strokeDashoffset="28" d="M9.5 19c0 -0.83 0.67 -1.5 1.5 -1.5h8c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5h-8c-0.83 0 -1.5 -0.67 -1.5 -1.5Z"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1s" dur="0.4s" to="0" /></path></g><g strokeDasharray="12" strokeDashoffset="12"><path d="M3.5 5c0 -0.83 0.67 -1.5 1.5 -1.5c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5c-0.83 0 -1.5 -0.67 -1.5 -1.5Z"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.3s" dur="0.2s" to="0" /></path><path d="M3.5 12c0 -0.83 0.67 -1.5 1.5 -1.5c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5c-0.83 0 -1.5 -0.67 -1.5 -1.5Z"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" to="0" /></path><path d="M3.5 19c0 -0.83 0.67 -1.5 1.5 -1.5c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5c-0.83 0 -1.5 -0.67 -1.5 -1.5Z"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.3s" dur="0.2s" to="0" /></path></g></g></svg>
  )
}
