import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UnsubscribeButton } from "@/components/unsubscribe-button"
import { OWNER } from "@/lib/facts"
import { validUnsubscribe } from "@/lib/unsubscribe"

// Where every email's unsubscribe link lands (links made by scripts/unsubscribe-links.mjs). Not for search results.
export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
}

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ e?: string; t?: string }> }) {
  const { e = "", t = "" } = await searchParams
  const email = e.trim().toLowerCase()
  const ok = validUnsubscribe(email, t)

  return (
    <>
      <Nav />
      <main id="main" className="relative flex min-h-screen items-center justify-center px-6 pt-24 pb-16">
        <Card className="w-full max-w-md rounded-2xl border-white/10 bg-(--ollie-card) text-white shadow-lg shadow-black/40">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight">Unsubscribe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-white/70 leading-relaxed">
            {ok ? (
              <>
                <p>
                  Stop emails from Ollie to <strong className="text-white">{email}</strong>?
                </p>
                <UnsubscribeButton email={email} token={t} />
              </>
            ) : (
              <p>
                This unsubscribe link isn&apos;t valid. Email{" "}
                <a href={`mailto:${OWNER.email}?subject=Unsubscribe`} className="text-(--ollie-cyan) underline underline-offset-4">
                  {OWNER.email}
                </a>{" "}
                from the address you want removed and we&apos;ll take it off the list within 10 business days.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}
