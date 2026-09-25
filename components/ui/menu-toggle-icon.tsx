"use client"

import { Menu, X } from "lucide-react"
import type { ComponentProps } from "react"

type MenuToggleIconProps = ComponentProps<"svg"> & {
  open: boolean
  duration?: number
}

export function MenuToggleIcon({ open, duration = 300, ...props }: MenuToggleIconProps) {
  const style = { transitionDuration: `${duration}ms`, ...props.style }
  return open ? <X {...props} style={style} /> : <Menu {...props} style={style} />
}
