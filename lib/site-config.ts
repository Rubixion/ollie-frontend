// ponytail: flip to false to bring the full site back live
export const COMING_SOON = false

// ponytail: current-release lockdown. true = only /match, /blog and the legal pages are live; the other
// pages 308 to /match and nav/footer only link to what's live. Set false for testing.
export const MATCH_ONLY = true

// The live domain. Every canonical URL, sitemap entry and JSON-LD id is built from this.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://ollie.ml").replace(/\/$/, "")

// Version of the Terms + Privacy Policy a user agrees to at signup (their "Last updated" date).
// Bump it whenever either page changes materially; it's stored with each user's consent.
export const TERMS_VERSION = "2026-09-23"
