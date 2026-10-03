import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { AccountPage } from "@/components/account-page"

// The profile page behind the account icon in the nav. Private to each user: not for search results.
export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
}

export default function Account() {
  return (
    <>
      <Nav />
      <main id="main" className="relative mx-auto min-h-screen w-full max-w-5xl px-4 pt-24 pb-16 md:px-6">
        <AccountPage />
      </main>
      <Footer />
    </>
  )
}
