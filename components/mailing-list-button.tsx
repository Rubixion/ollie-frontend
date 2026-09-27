"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useAuth } from "@/components/auth-provider"
import { EmailIcon, replayEmailIcon } from "@/components/ui/email-icon"
import NewsletterForm from "@/components/ui/newsletter-form"

// "Join the mailing list" opens the newsletter form in place (no account needed). Signed-in visitors get their
// email filled in.
export function MailingListButton({ className = "" }: { className?: string }) {
  const { user } = useAuth()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)

  return (
    <div className={`flex w-full flex-col items-center ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div
            key="form"
            className="w-full"
            initial={reduce ? false : { opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <NewsletterForm defaultEmail={user?.email ?? ""} />
          </motion.div>
        ) : (
          <motion.button
            key="button"
            type="button"
            onClick={() => setOpen(true)}
            onMouseEnter={(e) => { if (!reduce) replayEmailIcon(e.currentTarget) }}
            onFocus={(e) => { if (!reduce) replayEmailIcon(e.currentTarget) }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-(--ollie-cyan)/50 px-5 text-sm font-bold text-(--ollie-cyan) transition-colors hover:bg-(--ollie-cyan)/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"
          >
            <EmailIcon size={18} delay={1.1} aria-hidden="true" />
            Join the mailing list
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
