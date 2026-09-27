import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ScanFace, Users } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import ComingSoon02 from "@/components/ui/coming-soon-02"
import { MailingListButton } from "@/components/mailing-list-button"

// Coming-soon page, linked from the nav and footer. ponytail: kept out of search results and the sitemap until
// there's something to use here; drop the robots line when Search launches.
export const metadata: Metadata = {
  title: "Face Search: Coming Soon",
  description: "Upload a photo and find where that face appears on public social media. Coming soon to Ollie.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
}

const tool =
  "group inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"

export default function SearchPage() {
  return (
    <>
      {/* No DottedSurface here: the horizon and its sparkles are this page's background */}
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <ComingSoon02
          badge="Search · Coming soon"
          headline="Search social media with a photo"
          description="Upload a photo and Ollie's face-recognition AI will find where that face appears across public social media. We're building it now."
        >
          <p className="text-sm font-semibold text-white">While you wait, try Match and Compare for free.</p>
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <Link href="/match" className={`${tool} bg-(--ollie-cyan) text-black hover:opacity-90 active:scale-[0.98]`}>
              <ScanFace size={16} aria-hidden="true" />
              Match
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform motion-reduce:transition-none" aria-hidden="true" />
            </Link>
            <Link href="/compare" className={`${tool} border border-white/15 text-white hover:bg-white/[0.05]`}>
              <Users size={16} aria-hidden="true" />
              Compare
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </div>
          <MailingListButton className="mt-2" />
        </ComingSoon02>
      </main>
      <Footer />
    </>
  )
}
