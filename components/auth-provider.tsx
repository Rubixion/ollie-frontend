"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { TERMS_VERSION } from "@/lib/site-config"

// What the user ticked at signup. Kept in localStorage across the Google redirect, then sent to
// /api/consent (supabase/user_consents.sql) once they're signed in.
export interface SignupConsent {
  terms: boolean
  emailOptIn: boolean
}
const PENDING_CONSENT = "ollie_pending_consent"

export function rememberConsent(consent: SignupConsent) {
  try {
    localStorage.setItem(PENDING_CONSENT, JSON.stringify({ ...consent, termsVersion: TERMS_VERSION }))
  } catch {} // private mode etc.: email sign-ups still carry it in the account metadata
}

async function syncConsent(session: Session) {
  let pending: unknown = null
  const synced = `ollie_consent_synced:${session.user.id}`
  try {
    pending = JSON.parse(localStorage.getItem(PENDING_CONSENT) ?? "null")
    // nothing ticked in this browser: only sync an email sign-up's saved consent, once per device
    if (!pending && (!session.user.user_metadata?.terms_accepted || localStorage.getItem(synced))) return
  } catch {
    return
  }
  const res = await fetch("/api/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(pending ?? {}),
  }).catch(() => null)
  if (res?.ok) {
    try {
      localStorage.removeItem(PENDING_CONSENT)
      localStorage.setItem(synced, "1")
    } catch {}
  }
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, consent: SignupConsent) => Promise<string | null>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  isModalOpen: boolean
  openModal: (onSuccess?: () => void) => void
  closeModal: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isModalOpenRef = useRef(false)
  const onSuccessRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // ponytail: if NEXT_PUBLIC_SUPABASE_* wasn't inlined at build time, supabase.auth
    // throws synchronously here — degrade to logged-out instead of crashing the whole tree
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
        if (session) syncConsent(session)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null)
        if (session && event === "SIGNED_IN") syncConsent(session)
        if (session?.user && isModalOpenRef.current) {
          isModalOpenRef.current = false
          setIsModalOpen(false)
          onSuccessRef.current?.()
          onSuccessRef.current = null
        }
      })

      return () => subscription.unsubscribe()
    } catch (err) {
      console.error("Supabase auth unavailable:", err)
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error?.message ?? null
    } catch (err) {
      return err instanceof Error ? err.message : "Sign in failed"
    }
  }

  const signUp = async (email: string, password: string, consent: SignupConsent): Promise<string | null> => {
    try {
      rememberConsent(consent)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        // also saved on the account, in case they confirm their email on another device
        options: {
          data: {
            terms_accepted: consent.terms,
            terms_version: TERMS_VERSION,
            email_opt_in: consent.emailOptIn,
          },
        },
      })
      return error?.message ?? null
    } catch (err) {
      return err instanceof Error ? err.message : "Sign up failed"
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const signInWithGoogle = async () => {
    // ponytail: pin to one stable URL (not window.location.href) so it always matches a fixed
    // entry in Supabase's Redirect URLs allowlist, instead of a different exact URL per tab/query.
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? `${window.location.origin}/match` : undefined },
    })
  }

  const openModal = useCallback((onSuccess?: () => void) => {
    onSuccessRef.current = onSuccess ?? null
    isModalOpenRef.current = true
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    isModalOpenRef.current = false
    setIsModalOpen(false)
    onSuccessRef.current = null
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithGoogle, isModalOpen, openModal, closeModal }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
