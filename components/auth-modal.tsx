"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Mail, Lock, AlertCircle, Check } from "lucide-react"
import type { ComponentProps } from "react"
import { rememberConsent, useAuth } from "@/components/auth-provider"

type Tab = "signin" | "signup"

const LINK = "text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white"

// Native checkbox restyled: keeps keyboard, focus and form validation for free.
function Checkbox(props: ComponentProps<"input">) {
  return (
    <span className="relative grid size-4 shrink-0 place-items-center">
      <input
        type="checkbox"
        {...props}
        className="peer size-4 cursor-pointer appearance-none rounded-[5px] border border-white/25 bg-white/[0.04] transition-colors checked:border-(--ollie-cyan) checked:bg-(--ollie-cyan) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"
      />
      <Check size={11} strokeWidth={3.5} aria-hidden="true" className="pointer-events-none absolute text-black opacity-0 transition-opacity peer-checked:opacity-100" />
    </span>
  )
}

export function AuthModal() {
  const { isModalOpen, closeModal, signIn, signUp, signInWithGoogle, initialAuthTab } = useAuth()
  const [tab, setTab] = useState<Tab>(initialAuthTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [agree, setAgree] = useState(false)         // required: Terms (which set the 18+ rule) and Privacy
  const [emailOptIn, setEmailOptIn] = useState(false) // optional: email list (never pre-ticked)

  useEffect(() => {
    if (!isModalOpen) return
    const id = window.setTimeout(() => {
      setTab(initialAuthTab)
      setError(null)
      setSuccess(null)
    }, 0)
    return () => window.clearTimeout(id)
  }, [initialAuthTab, isModalOpen])

  // Escape closes the modal, like the X
  useEffect(() => {
    if (!isModalOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isModalOpen, closeModal])

  const needsAgreement = () => {
    if (tab === "signup" && !agree) {
      setError("Please agree to the Terms and Privacy Policy.")
      return true
    }
    return false
  }

  const handleGoogle = () => {
    setError(null)
    if (needsAgreement()) return
    if (tab === "signup") rememberConsent({ terms: true, emailOptIn })
    signInWithGoogle()
  }

  const switchTab = (t: Tab) => {
    setTab(t)
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (needsAgreement()) return
    setLoading(true)

    const err = tab === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, { terms: true, emailOptIn })

    if (err) {
      setError(err)
    } else if (tab === "signup") {
      // straight to Sign In with the email kept, so they can log in once they've confirmed
      setTab("signin")
      setPassword("")
      setSuccess(`We sent a confirmation link to ${email}. Click it, then sign in below.`)
    }

    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={closeModal}
          />

          <div className="fixed inset-0 z-[101] flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
              className="w-full max-w-sm pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#080808] border border-white/10 rounded-2xl shadow-2xl shadow-black overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-white tracking-tight">
                      {tab === "signin" ? "Welcome back" : "Join Ollie"}
                    </h2>
                    <p className="text-white/60 text-xs mt-1 leading-relaxed">
                      {tab === "signin" ? "Sign in to keep searching." : "Free. Sign up for more searches."}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white/60 hover:text-white/60 transition-colors ml-4 mt-0.5 shrink-0"
                    aria-label="Close"
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="px-6 pb-4">
                  <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/8">
                    {(["signin", "signup"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => switchTab(t)}
                        className={`relative flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          tab === t ? "text-black" : "text-white/60 hover:text-white/60"
                        }`}
                      >
                        {tab === t && (
                          <motion.div
                            layoutId="auth-tab"
                            className="absolute inset-0 bg-(--ollie-cyan) rounded-lg"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                          />
                        )}
                        <span className="relative z-10">{t === "signin" ? "Sign In" : "Sign Up"}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  {success && (
                    <div role="status" className="flex items-start gap-2.5 rounded-xl border border-green-500/20 bg-green-500/10 p-3">
                      <Mail size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-green-300" />
                      <p className="text-xs leading-relaxed text-green-200">
                        <span className="block font-bold text-green-300">Check your email</span>
                        {success}
                      </p>
                    </div>
                  )}

                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/60 text-sm font-semibold hover:bg-white/[0.06] hover:text-white hover:border-white/20 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center">
                    <span className="flex-1 border-t border-white/8" />
                    <span className="px-3 text-white/60 text-[10px] uppercase tracking-widest">or</span>
                    <span className="flex-1 border-t border-white/8" />
                  </div>

                  {/* Email + password form */}
                  <form onSubmit={handleSubmit} className="space-y-2.5">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" size={14} />
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" size={14} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete={tab === "signin" ? "current-password" : "new-password"}
                        className="w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl pl-9 pr-10 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/50 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {tab === "signup" ? (
                      <div className="space-y-3 py-1">
                        <label className="flex cursor-pointer items-center gap-3">
                          <Checkbox
                            checked={agree}
                            onChange={(e) => { setAgree(e.target.checked); setError(null) }}
                            required
                          />
                          <span className="text-xs leading-snug text-white/70">
                            I agree to the{" "}
                            <a href="/terms" target="_blank" className={LINK}>Terms</a>
                            {" "}and{" "}
                            <a href="/privacy" target="_blank" className={LINK}>Privacy Policy</a>
                          </span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-3">
                          <Checkbox checked={emailOptIn} onChange={(e) => setEmailOptIn(e.target.checked)} />
                          <span className="text-xs leading-snug text-white/70">
                            Email me about new features
                            <span className="block text-[11px] text-white/50">Optional · unsubscribe any time</span>
                          </span>
                        </label>
                      </div>
                    ) : (
                      <p className="py-1 text-center text-[10px] leading-relaxed text-white/60">
                        By continuing you agree to our{" "}
                        <a href="/terms" className="underline hover:text-white/35">Terms</a>
                        {" "}&amp;{" "}
                        <a href="/privacy" className="underline hover:text-white/35">Privacy Policy</a>
                      </p>
                    )}

                    {error && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/15">
                        <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-300 text-xs leading-relaxed">{error}</p>
                      </div>
                    )}


                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-(--ollie-cyan) text-black font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? (tab === "signin" ? "Signing in..." : "Creating account...")
                        : (tab === "signin" ? "Sign In" : "Create Account")}
                    </button>
                  </form>

                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
