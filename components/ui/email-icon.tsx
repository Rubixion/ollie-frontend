import type { SVGProps } from "react"

// Draws the envelope again (e.g. on hover of its button): pass any element that contains the icon
export function replayEmailIcon(el: Element | null) {
  const [outline, flap] = Array.from(el?.querySelectorAll<SVGAnimationElement>("[data-email-icon] animate") ?? [])
  outline?.beginElement()
  flap?.beginElementAt(0.6)
}

// Envelope that draws itself in when it mounts: the outline (0.6s), then the flap (0.3s). Plain SVG animation, no JS.
// delay (seconds) holds it blank until then, e.g. while its button is still fading in.
export function EmailIcon({ size = 24, delay = 0, ...props }: SVGProps<SVGSVGElement> & { size?: number; delay?: number }) {
  return (
    <svg data-email-icon="" width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path
          strokeDasharray="66"
          strokeDashoffset="66"
          d="M4 5h16c0.55 0 1 0.45 1 1v12c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-12c0 -0.55 0.45 -1 1 -1Z"
        >
          <animate fill="freeze" attributeName="stroke-dashoffset" begin={`${delay}s`} dur="0.6s" values="66;0" />
        </path>
        <path strokeDasharray="24" strokeDashoffset="24" d="M3 6.5l9 5.5l9 -5.5">
          <animate fill="freeze" attributeName="stroke-dashoffset" begin={`${delay + 0.6}s`} dur="0.3s" values="24;0" />
        </path>
      </g>
    </svg>
  )
}
