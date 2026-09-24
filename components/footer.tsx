"use client"

import Link from "next/link"
import { MATCH_ONLY } from "@/lib/site-config"

const nav = MATCH_ONLY
  ? [
      { label: "Match", href: "/match" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ]
  : [
      { label: "Match", href: "/match" },
      { label: "How It Works", href: "/ai" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ]

const legal = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
]

export function Footer() {
  return (
    <footer className="border-t border-white/5 pt-12 pb-8 px-6 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
          {/* Brand */}
          <div>
            <Link href={MATCH_ONLY ? "/match" : "/"} className="text-white font-black text-xl tracking-widest hover:text-white/60 transition-colors">
              OLLIE
            </Link>
            <p className="text-white/60 text-xs leading-relaxed mt-3 max-w-[220px]">
              Celebrity look-alike search. Upload a photo and see who you look like.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-4">Pages</p>
              <ul className="flex flex-col gap-3">
                {nav.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/60 hover:text-white/70 text-sm transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-4">Legal</p>
              <ul className="flex flex-col gap-3">
                {legal.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/60 hover:text-white/70 text-sm transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <p className="text-white/60 text-xs">
            &copy; 2026 Ollie. Built on a face-recognition network trained from scratch.
          </p>
          <p className="text-white/60 text-xs">
            For entertainment only. Not affiliated with or endorsed by anyone shown.
          </p>
        </div>
      </div>
    </footer>
  )
}
