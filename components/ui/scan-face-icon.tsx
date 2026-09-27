// scan face - from Lucide Animated (https://lucide-animated.com)
// Author: dmytro (@pqoqubbw)
// License: MIT. Source: https://github.com/pqoqubbw/icons
// Ollie: stays still for prefers-reduced-motion, like users-icon.tsx; the mouth no longer fades out with the corners;
// hover replays the entrance instead of the original fly-out
"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface ScanFaceIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ScanFaceIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  appear?: boolean; // start with the corners hidden; stopAnimation() then springs them in (a page-load entrance)
}

const faceVariants: Variants = {
  visible: { scale: 1 },
  hidden: {
    scale: 0.9,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

const CORNERS = ["M3 7V5a2 2 0 0 1 2-2h2", "M17 3h2a2 2 0 0 1 2 2v2", "M21 17v2a2 2 0 0 1-2 2h-2", "M7 21H5a2 2 0 0 1-2-2v-2"];

// custom = the corner's index, so they land one after another
const cornerVariants: Variants = {
  visible: (i: number) => ({
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 18, delay: i * 0.07 },
  }),
  hidden: {
    scale: 1.2,
    rotate: 45,
    opacity: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

const ScanFaceIcon = forwardRef<ScanFaceIconHandle, ScanFaceIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, appear = false, ...props }, ref) => {
    const controls = useAnimation();
    const reduced = useReducedMotion();
    const isControlledRef = useRef(false);

    // Same as the "appear" entrance: corners vanish instantly, then spring back in one by one
    const play = useCallback(async () => {
      if (reduced) return;
      controls.set("hidden");
      await controls.start("visible");
    }, [controls, reduced]);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: play,
        stopAnimation: () => controls.start("visible"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) onMouseEnter?.(e);
        else play();
      },
      [onMouseEnter, play]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) onMouseLeave?.(e);
        else controls.start("visible");
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          variants={faceVariants}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          {CORNERS.map((d, i) => (
            <motion.path key={d} animate={controls} custom={i} d={d} initial={appear ? "hidden" : "visible"} variants={cornerVariants} />
          ))}
          {/* Ollie: the face (eyes and mouth) stays put; only the scan corners animate in */}
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" x2="9.01" y1="9" y2="9" />
          <line x1="15" x2="15.01" y1="9" y2="9" />
        </motion.svg>
      </div>
    );
  }
);

ScanFaceIcon.displayName = "ScanFaceIcon";

export { ScanFaceIcon };
