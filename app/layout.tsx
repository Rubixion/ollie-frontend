import type { Metadata, Viewport } from "next"
import { Outfit } from "next/font/google"
import Script from "next/script"

import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { AuthModal } from "@/components/auth-modal"
import { cn } from "@/lib/utils"
import { GA_ID, SITE_URL } from "@/lib/site-config"

// EEA + UK + Switzerland: GDPR/ePrivacy need opt-in before analytics cookies.
const CONSENT_REGIONS = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","CH"]

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "900"], // only the weights in use (docs/DESIGN.md)
})

const description =
  "Upload a photo and see which celebrities you look like. Ollie's face-recognition network compares your face with thousands of celebrity photos. Free to try."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ollie: Which Celebrity Do You Look Like?",
    template: "%s | Ollie",
  },
  description,
  applicationName: "Ollie",
  openGraph: {
    type: "website",
    siteName: "Ollie",
    title: "Ollie: Which Celebrity Do You Look Like?",
    description,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ollie: Which Celebrity Do You Look Like?",
    description,
  },
  // one directive for every crawler; each page sets its own canonical (none is inherited from here)
  robots: { index: true, follow: true, "max-image-preview": "large" },
}

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn("dark antialiased", outfit.variable)}
    >
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-(--ollie-cyan) focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black"
        >
          Skip to content
        </a>
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
        {/* Google Analytics. EEA, UK and Swiss visitors start with analytics cookies denied (consent mode):
            those laws need opt-in consent first, and there's no consent banner yet.
            lazyOnload: gtag.js is ~170 KB of script, so it waits until the page is idle instead of competing
            with first paint and the uploader (it still counts the visit; very fast bounces may be missed). */}
        <Script id="gtag-init" strategy="lazyOnload">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', region: ${JSON.stringify(CONSENT_REGIONS)} });
          gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  name: "Ollie",
                  url: SITE_URL,
                  logo: `${SITE_URL}/icon.svg`,
                  description:
                    "Ollie is a celebrity lookalike search built on a facial recognition neural network trained from scratch.",
                  knowsAbout: ["Face recognition", "Deep learning", "Convolutional neural networks", "Celebrity look-alikes"],
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  name: "Ollie",
                  url: SITE_URL,
                  inLanguage: "en",
                  publisher: { "@id": `${SITE_URL}/#organization` },
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  )
}
