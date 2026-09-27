// Social Share Button from 21st.dev (Shatlyk1011/social-button): https://21st.dev/Shatlyk1011/social-button
// Ollie: the buttons now share `url` for real (X, LinkedIn, Facebook, Reddit; Instagram has no link sharing),
// copy link uses the clipboard, brand logos from svgl.app (lucide dropped brand icons), dark colors only,
// the site's cn(), and an aria-label on each button. Share opens the native share sheet first (handleShare).
'use client'

import { useState, FC, ReactNode, useRef, useEffect, type RefObject } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'

function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) handler()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, handler])
}

const shareButtons = [
  { icon: '/icons/x.svg', label: 'X', href: (u: string, t: string) => `https://x.com/intent/post?url=${u}&text=${t}` },
  { icon: '/icons/linkedin.svg', label: 'LinkedIn', href: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  { icon: '/icons/facebook.svg', label: 'Facebook', href: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  { icon: '/icons/reddit.svg', label: 'Reddit', href: (u: string, t: string) => `https://www.reddit.com/submit?url=${u}&title=${t}` },
]

export default function SocialButton({ url, title, className }: { url: string; title: string; className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {} // clipboard blocked: nothing to do
  }

  // The device's own share sheet (every app installed) where the browser has one; the icon row is the fallback
  const handleShare = async () => {
    if (!navigator.share) return setIsExpanded(true)
    try {
      await navigator.share({ url, title })
      track('share', { content_type: 'article' })
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) setIsExpanded(true) // AbortError = sheet closed
    }
  }

  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)

  return (
    <OnClickOutside onClickOutside={() => setIsExpanded(false)}>
      <div className={cn('flex items-center', className)}>
        <motion.div
          animate={{ width: isExpanded ? 'auto' : '120px', height: '48px' }}
          className={cn(
            'relative flex items-center overflow-hidden',
            'bg-(--ollie-card) text-white/80',
            'border border-white/10',
            'shadow-sm hover:shadow-md',
            'cursor-pointer rounded-full'
          )}
          initial={false}
          onClick={() => !isExpanded && handleShare()}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <AnimatePresence mode='sync'>
            {!isExpanded ? (
              <motion.button type='button' aria-label='Share this article' className='absolute inset-0 flex items-center justify-center gap-2' exit={{ opacity: 0, y: -20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key='share-text' transition={{ duration: 0.2 }}>
                <Share2 className='h-4 w-4' />
                <span className='text-sm font-medium'>Share</span>
              </motion.button>
            ) : (
              <motion.div className='flex items-center px-1' exit={{ opacity: 0, scale: 0.9 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key='actions' transition={{ delay: 0.1, duration: 0.2 }}>
                {shareButtons.map((btn) => (
                  <a
                    className='flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10'
                    key={btn.label}
                    href={btn.href(u, t)}
                    target='_blank'
                    rel='noopener noreferrer'
                    title={`Share on ${btn.label}`}
                    aria-label={`Share on ${btn.label}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={btn.icon} alt='' className='h-5 w-5' />
                  </a>
                ))}
                <div className='mx-1 h-6 w-px bg-white/10' />
                <button
                  className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-colors', 'text-white/70', 'hover:bg-white/10', copied && 'bg-green-900/20 text-green-500')}
                  onClick={(e) => { e.stopPropagation(); handleCopy() }}
                  type='button' title='Copy link' aria-label={copied ? 'Link copied' : 'Copy link'}
                >
                  {copied ? <Check className='h-5 w-5' /> : <Copy className='h-5 w-5' />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </OnClickOutside>
  )
}

interface OnClickOutsideProps { children: ReactNode; onClickOutside: () => void; classes?: string }
const OnClickOutside: FC<OnClickOutsideProps> = ({ children, onClickOutside, classes }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  useClickOutside(wrapperRef, onClickOutside)
  return <div ref={wrapperRef} className={cn(classes)}>{children}</div>
}
