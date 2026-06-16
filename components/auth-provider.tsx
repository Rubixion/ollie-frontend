"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
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
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  const signUp = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({ email, password })
    return error?.message ?? null
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.href : undefined },
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
