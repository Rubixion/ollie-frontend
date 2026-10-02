import { PageLink } from "@/components/page-link"
import { LOOK_ALIKE_LIVE, MATCH_ONLY, SYMMETRY_LIVE } from "@/lib/site-config"

const nav = MATCH_ONLY
  ? [
      { label: "Home", href: "/" },
      { label: "Celebrity Lookalike", href: "/celebrity-lookalike" },
      { label: "Compare", href: "/compare-faces" },
      { label: "AI Stylist", href: "/ai-stylist" },
      ...(SYMMETRY_LIVE ? [{ label: "Symmetry Test", href: "/face-symmetry-test" }] : []),
      ...(LOOK_ALIKE_LIVE ? [{ label: "Famous Look Alikes", href: "/look-alike" }] : []),
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ]
  : [
      { label: "Celebrity Lookalike", href: "/celebrity-lookalike" },
      { label: "How It Works", href: "/ai" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ]

// Key guides linked from every page: the footer is a strong internal-linking spot for the posts that target the
// biggest searches (celebrity look alike finder, best photo, results, how the AI works)
const guides = [
  { label: "Celebrity lookalike finder guide", href: "/blog/find-your-celebrity-lookalike" },
  { label: "Best photo for a match", href: "/blog/best-photo-celebrity-match" },
  { label: "Understanding your results", href: "/blog/understanding-your-results" },
  { label: "How face recognition works", href: "/blog/how-face-recognition-works" },
]

const legal = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
]

export function Footer() {
  return (
    <footer className="pt-12 pb-8 px-6 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          {/* Brand */}
          <div>
            <PageLink href="/" className="text-white font-black text-xl tracking-widest hover:text-white/60 transition-colors">
              OLLIE
            </PageLink>
            <p className="text-white/60 text-xs leading-relaxed mt-3 max-w-[220px]">
              Celebrity lookalike AI. Upload a photo and see who you look like.
            </p>
            <p className="text-white/60 text-xs mt-3">&copy; 2026 Ollie</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-16 gap-y-10">
            <div>
              <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-4">Pages</p>
              {/* Two columns, filled top to bottom: the tools on the left, the rest on the right */}
              <ul className="grid grid-flow-col grid-rows-4 gap-x-12 gap-y-3">
                {nav.map((l) => (
                  <li key={l.href}>
                    <PageLink href={l.href} className="text-white/60 hover:text-white/70 text-sm transition-colors">
                      {l.label}
                    </PageLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-4">Guides</p>
              <ul className="flex flex-col gap-3">
                {guides.map((l) => (
                  <li key={l.href}>
                    <PageLink href={l.href} className="text-white/60 hover:text-white/70 text-sm transition-colors">
                      {l.label}
                    </PageLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-4">Legal</p>
              <ul className="flex flex-col gap-3">
                {legal.map((l) => (
                  <li key={l.href}>
                    <PageLink href={l.href} className="text-white/60 hover:text-white/70 text-sm transition-colors">
                      {l.label}
                    </PageLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
