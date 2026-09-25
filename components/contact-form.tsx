"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cardOpen } from "@/lib/surfaces"

// Same Formspree form as the chemistry calculator's bug report
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xjgdzbpv"

const TOPICS = ["Questions and bugs", "Privacy request", "Photo removal", "Legal and press", "Other"]

const field =
  "w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-(--ollie-cyan)/60 focus:outline-none"

// Custom dropdown, same popup as the match page's "Show" menu (a native <select> opens in OS colours
// that clash with the dark theme). The value is posted through a hidden input.
function TopicMenu({ value, onChange, invalid }: { value: string; onChange: (t: string) => void; invalid: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <span id="topic-label" className="mb-1.5 block text-sm text-white/60">Topic</span>
      <input type="hidden" name="topic" value={value} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="topic-label"
        aria-describedby={invalid ? "topic-error" : undefined}
        onClick={() => setOpen((o) => !o)}
        className={`${field} flex items-center justify-between text-left ${invalid ? "border-red-400/60" : ""}`}
      >
        <span className={value ? "text-white" : "text-white/50"}>{value || "Choose a topic"}</span>
        <ChevronDown size={16} className={`text-white/60 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-labelledby="topic-label"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-white/10 bg-black/90 p-1 shadow-xl shadow-black/50 backdrop-blur-md"
          >
            {TOPICS.map((t) => (
              <li key={t} role="option" aria-selected={t === value}>
                <button
                  type="button"
                  onClick={() => { onChange(t); setOpen(false) }}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    t === value ? "bg-(--ollie-cyan)/10 text-(--ollie-cyan)" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  {t}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      {invalid && <p id="topic-error" className="mt-1.5 text-sm text-red-300">Choose a topic.</p>}
    </div>
  )
}

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [topic, setTopic] = useState("")
  const [topicMissing, setTopicMissing] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!topic) return setTopicMissing(true) // a hidden input can't be `required`
    setStatus("sending")
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
      if (!res.ok) throw new Error()
      form.reset()
      setTopic("")
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  return (
    <form onSubmit={onSubmit} className={`${cardOpen} space-y-4 p-5 md:p-6`}>
      <TopicMenu value={topic} onChange={(t) => { setTopic(t); setTopicMissing(false) }} invalid={topicMissing} />
      <label className="block">
        <span className="mb-1.5 block text-sm text-white/60">Your email (optional, if you want a reply)</span>
        <input type="email" name="email" autoComplete="email" className={field} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm text-white/60">Message</span>
        <textarea name="message" required rows={4} className={`${field} resize-y`} />
      </label>
      <input type="hidden" name="page" value="contact" />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-(--ollie-cyan) py-3 text-sm font-bold text-black transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send"}
      </button>
      <p role="status" className="text-sm text-white/70 min-h-5">
        {status === "sent" && "Sent. Thanks, we'll get back to you if you left an email."}
        {status === "error" && "Couldn't send. Try again, or use the email above."}
      </p>
    </form>
  )
}
