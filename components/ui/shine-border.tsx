// 21st.dev: shadcnspace/shine-border-02 (the ShineBorder part only), a laser-scanner sweep around its content.
// Recoloured to the one Ollie blue; the sweep stops under prefers-reduced-motion.
import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"

type ShineBorderProps = {
  children: ReactNode
  className?: string
  borderWidth?: number
  duration?: number
  gradient?: string
}

export const ShineBorder = ({
  children,
  className,
  borderWidth = 2,
  duration = 3,
  gradient = "from-transparent via-(--ollie-cyan) to-transparent",
}: ShineBorderProps) => {
  return (
    <>
      <style>{`
        @keyframes shine-scan {
          0% { mask-position: 0% -100%; -webkit-mask-position: 0% -100%; }
          100% { mask-position: 0% 200%; -webkit-mask-position: 0% 200%; }
        }
        .animate-shine-scan {
          mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 25%, transparent 40%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 25%, transparent 40%);
          mask-size: 100% 300%;
          -webkit-mask-size: 100% 300%;
          animation: shine-scan var(--duration, 3s) linear infinite;
        }
        @media (prefers-reduced-motion: reduce) { .animate-shine-scan { animation: none; } }
      `}</style>
      <div
        className={cn("relative rounded-2xl overflow-hidden border border-white/10 p-(--bw)", className)}
        style={{ "--bw": `${borderWidth}px` } as React.CSSProperties}
      >
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className={cn("absolute inset-0 bg-linear-to-b animate-shine-scan opacity-90 blur-sm", gradient)}
            style={{ "--duration": `${duration}s` } as React.CSSProperties}
          />
        </div>
        <div className="relative z-10 rounded-2xl bg-black h-full overflow-hidden">{children}</div>
      </div>
    </>
  )
}
