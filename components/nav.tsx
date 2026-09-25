"use client"

import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"
import type { ComponentProps } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LogOut, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { PageLink } from "@/components/page-link"
import { Button, buttonVariants } from "@/components/ui/button"
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon"
import { useScroll } from "@/components/ui/use-scroll"
import { cn } from "@/lib/utils"
import { MATCH_ONLY } from "@/lib/site-config"

const links = MATCH_ONLY
  ? [
      { label: "Home", href: "/" },
      { label: "Match", href: "/match" },
      { label: "Contact", href: "/contact" },
    ]
  : [
      { label: "Match", href: "/match" },
      { label: "Projects", href: "/projects" },
      { label: "About", href: "/about" },
    ]

function ProfileMenu() {
  const { user, signOut, openModal } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
  const onDown = (event: globalThis.MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
  }

  document.addEventListener("mousedown", onDown)
  return () => document.removeEventListener("mousedown", onDown)
}, [])

  if (!user) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Button variant="outline" onClick={() => openModal(undefined, "signin")}>Sign In</Button>
        <Button onClick={() => openModal(undefined, "signup")}>Get Started</Button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white/60 transition-colors hover:border-white/25 hover:bg-white/[0.1] hover:text-white"
        aria-label="Account menu"
      >
        <User size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black"
          >
            <div className="border-b border-white/5 px-4 py-3">
              <p className="mb-0.5 text-[10px] uppercase tracking-widest text-white/60">Signed in as</p>
              <p className="truncate text-xs font-medium text-white/70">{user.email}</p>
            </div>
            <button
              onClick={() => { signOut(); setOpen(false) }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type MobileMenuProps = ComponentProps<"div"> & { open: boolean }

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === "undefined") return null

  return createPortal(
    <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-hidden border-y border-white/10 bg-black/95 backdrop-blur-xl md:hidden">
      <div className={cn("size-full p-4", className)} {...props}>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function Nav() {
  const { user, openModal, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const scrolled = useScroll(10)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 w-full border-b border-transparent transition-colors duration-200",
        scrolled && "border-white/10 bg-black/80 shadow-lg shadow-black/30 backdrop-blur-xl",
      )}
    >
      <nav className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        <PageLink href="/" onClick={() => setOpen(false)} className="col-start-1 shrink-0 justify-self-start rounded-lg p-2 text-xl font-black tracking-widest text-white transition-colors hover:bg-white/[0.05] hover:text-white/70">
          OLLIE
        </PageLink>

        <div className="col-start-2 hidden min-w-0 items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <PageLink
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={buttonVariants({
                  variant: active ? "secondary" : "ghost",
                  className: active ? "text-white" : "text-white/60 hover:text-white",
                })}
              >
                {link.label}
              </PageLink>
            )
          })}
        </div>

        <div className="col-start-3 flex items-center justify-self-end">
          <ProfileMenu />

          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen((value) => !value)}
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <MenuToggleIcon open={open} className="size-5" />
          </Button>
        </div>
      </nav>

      <MobileMenu open={open} id="mobile-menu" className="flex flex-col justify-between gap-3">
        <div className="grid gap-y-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <PageLink
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: active ? "secondary" : "ghost", className: "justify-start text-base" })}
              >
                {link.label}
              </PageLink>
            )
          })}
        </div>
        <div className="flex flex-col gap-2">
          {user ? (
            <>
              <p className="px-1 text-xs text-white/60">{user.email}</p>
              <Button variant="outline" className="w-full justify-start text-red-300" onClick={() => { signOut(); setOpen(false) }}>
                <LogOut size={15} />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full" onClick={() => { openModal(undefined, "signin"); setOpen(false) }}>Sign In</Button>
              <Button className="w-full" onClick={() => { openModal(undefined, "signup"); setOpen(false) }}>Get Started</Button>
            </>
          )}
        </div>
      </MobileMenu>
    </header>
  )
}
