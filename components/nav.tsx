"use client"

import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import type { ComponentProps } from "react"
import { LogOut, Settings } from "lucide-react"
import { AccountIcon } from "@/components/ui/account-icon"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
      { label: "Celebrity Lookalike", href: "/celebrity-lookalike" },
      { label: "Compare", href: "/compare-faces" },
      { label: "AI Stylist", href: "/ai-stylist" },
      { label: "Contact", href: "/contact" },
    ]
  : [
      { label: "Celebrity Lookalike", href: "/celebrity-lookalike" },
      { label: "Projects", href: "/projects" },
      { label: "About", href: "/about" },
    ]

function ProfileMenu() {
  const { user, openModal, signOut } = useAuth()
  if (!user) {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Button variant="outline" onClick={() => openModal(undefined, "signin")}>Sign In</Button>
        <Button onClick={() => openModal(undefined, "signup")}>Get Started</Button>
      </div>
    )
  }
  // the account icon opens a menu: settings (/account) or sign out
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger aria-label="Your account"
        className="hidden size-9 items-center justify-center text-white/60 outline-none transition-colors hover:text-white data-[state=open]:text-white lg:flex">
        <AccountIcon size={22} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate text-xs font-normal text-white/60">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <PageLink href="/account"><Settings size={15} /> Settings</PageLink>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-300 focus:text-red-300" onSelect={() => signOut()}>
          <LogOut size={15} /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type MobileMenuProps = ComponentProps<"div"> & { open: boolean }

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === "undefined") return null

  return createPortal(
    <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-hidden border-y border-white/10 bg-black/95 backdrop-blur-xl lg:hidden">
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

        <div className="col-start-2 hidden min-w-0 items-center gap-1 lg:flex">
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
            className="lg:hidden"
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
              <PageLink href="/account" onClick={() => setOpen(false)} className={buttonVariants({ variant: "outline", className: "w-full justify-start" })}>
                <AccountIcon size={15} aria-hidden="true" />
                Your account
              </PageLink>
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
