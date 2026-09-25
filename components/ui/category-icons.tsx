import type { SVGProps } from "react"

// Static icons for the celebrity categories in the model section (no animation on purpose)
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

export function FilmSlateIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><g fill="none" stroke="currentColor" strokeWidth="2"><path d="M3.5 10.5h14.412c1.456 0 2.184 0 2.636.44c.452.439.452 1.146.452 2.56V15c0 3.3 0 4.95-1.055 5.975C18.889 22 17.19 22 13.795 22h-3.09c-3.396 0-5.094 0-6.15-1.025C3.5 19.95 3.5 18.3 3.5 15zm-.002 0c-.357-1.358-.535-2.037-.491-2.634a3.54 3.54 0 0 1 1.5-2.648c.485-.337 1.152-.519 2.484-.883l7.741-2.113c.345-.094.517-.141.666-.168c1.652-.297 3.276.658 3.85 2.265c.051.144.098.32.19.671c.026.1.04.15.047.194a1.01 1.01 0 0 1-.635 1.12c-.04.016-.09.03-.188.056zM7 10l2-6m5 4l2-6" /><path strokeLinecap="round" d="M8 18h3" /></g></svg>
  )
}

export function MicrophoneIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M9 5a3 3 0 0 1 3-3a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3a3 3 0 0 1-3-3z" /><path d="M5 10a7 7 0 0 0 14 0M8 21h8m-4-4v4" /></g></svg>
  )
}

export function TrophyIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M10 14.66V17a1 1 0 0 1-1 1a2 2 0 0 0-2 2v2m7-7.34V17a1 1 0 0 0 1 1a2 2 0 0 1 2 2v2m.916-12H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3M4 22h16" /><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" /><path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3" /></g></svg>
  )
}
