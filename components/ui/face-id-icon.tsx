"use client";

// Face ID glyph, animated to match the AnimateIcons handle API (startAnimation / stopAnimation):
// the frame locks on, a scan line sweeps down, then the face draws in.
import { cn } from "@/lib/utils";
import type { Variants } from "motion/react";
import { LazyMotion, domMin, m, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useImperativeHandle, type HTMLAttributes } from "react";

export interface FaceIdIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FaceIdIconProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "color" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
> {
  size?: number;
  duration?: number;
  color?: string;
}

const CORNERS =
  "M2.5 8.187c.104-2.1.415-3.41 1.347-4.34c.93-.932 2.24-1.243 4.34-1.347M21.5 8.187c-.104-2.1-.415-3.41-1.347-4.34c-.93-.932-2.24-1.243-4.34-1.347m0 19c2.1-.104 3.41-.415 4.34-1.347c.932-.93 1.243-2.24 1.347-4.34M8.187 21.5c-2.1-.104-3.41-.415-4.34-1.347c-.932-.93-1.243-2.24-1.347-4.34";
const FACE =
  "M17.5 17l-.202-.849a2 2 0 0 0-1.392-1.458l-2.406-.694v-1.467c.896-.605 1.5-1.736 1.5-3.032C15 7.567 13.656 6 12 6c-1.657 0-3 1.567-3 3.5c0 1.296.603 2.427 1.5 3.032v1.467l-2.391.7a2 2 0 0 0-1.371 1.406L6.5 17";
const CENTER = { transformBox: "view-box", originX: "12px", originY: "12px" } as const;

const FaceIdIcon = forwardRef<FaceIdIconHandle, FaceIdIconProps>(
  ({ className, size = 24, duration = 1, color, ...props }, ref) => {
    const controls = useAnimation();
    const reduced = useReducedMotion();

    useImperativeHandle(ref, () => ({
      startAnimation: () => controls.start(reduced ? "normal" : "animate"),
      stopAnimation: () => controls.start("normal"),
    }));

    const cornerVariants: Variants = {
      normal: { scale: 1, opacity: 1 },
      animate: {
        scale: [1.25, 0.95, 1],
        opacity: [0, 1, 1],
        transition: { duration: 0.45 * duration, times: [0, 0.7, 1], ease: "easeOut" },
      },
    };

    const scanVariants: Variants = {
      normal: { y: -7, opacity: 0 },
      animate: {
        y: [-7, 7],
        opacity: [0, 1, 1, 0],
        transition: { duration: 0.7 * duration, delay: 0.3 * duration, ease: "easeInOut" },
      },
    };

    const faceVariants: Variants = {
      normal: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.6 * duration, delay: 0.45 * duration, ease: [0.16, 1, 0.3, 1] },
      },
    };

    return (
      <LazyMotion features={domMin} strict>
        <m.div className={cn("inline-flex items-center justify-center", className)} {...props} style={{ color, ...props.style }}>
          <m.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={controls}
            initial="normal"
          >
            <m.path d={CORNERS} variants={cornerVariants} style={CENTER} />
            <m.path d="M5 12h14" strokeWidth="1.5" variants={scanVariants} />
            <m.path d={FACE} variants={faceVariants} />
          </m.svg>
        </m.div>
      </LazyMotion>
    );
  },
);

FaceIdIcon.displayName = "FaceIdIcon";
export { FaceIdIcon };
