import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import ComingSoon02 from "@/components/ui/coming-soon-02"
import { MailingListButton } from "@/components/mailing-list-button"
import { TryTools } from "@/components/try-tools"

// Coming-soon page, linked from the nav and footer. ponytail: kept out of search results and the sitemap until
// there's something to use here; drop the robots line when Search launches.
export const metadata: Metadata = {
  title: "Face Search: Coming Soon",
  description: "Upload a photo and find where that face appears on public social media. Coming soon to Ollie.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
}

export default function SearchPage() {
  return (
    <>
      {/* No DottedSurface here: the horizon and its sparkles are this page's background */}
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <ComingSoon02
          headline="Search social media with a photo"
          description="Upload a photo and Ollie's face-recognition AI will find where that face appears across public social media. We're building it now."
        >
          <p className="text-sm font-semibold text-white">While you wait, try Match and Compare for free.</p>
          <TryTools />
          <MailingListButton className="mt-2" />
        </ComingSoon02>
      </main>
      <Footer />
    </>
  )
}
