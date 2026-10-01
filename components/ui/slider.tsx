"use client"

// 21st.dev originui/slider (shadcn Slider), via the radix-ui package; tooltip variant dropped, colours set for Ollie.
import { Slider as SliderPrimitive } from "radix-ui"
import * as React from "react"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const count = ((props.value ?? props.defaultValue ?? [0]) as number[]).length
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative grow overflow-hidden rounded-full bg-white/10 data-[orientation=horizontal]:h-2 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-2">
        <SliderPrimitive.Range className="absolute bg-(--ollie-cyan) data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
      </SliderPrimitive.Track>
      {Array.from({ length: count }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block size-5 rounded-full border-2 border-(--ollie-cyan) bg-[#0b0b14] transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-(--ollie-cyan)/40 data-[disabled]:cursor-not-allowed"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = "Slider"

export { Slider }
