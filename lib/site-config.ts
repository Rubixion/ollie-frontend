// ponytail: flip to false to bring the full site back live
export const COMING_SOON = false

// ponytail: current-release lockdown. true = only /, /match, /blog and the legal pages are live; the other
// pages 308 to /match and nav/footer only link to what's live. Set false for testing.
export const MATCH_ONLY = true

// The live domain. Every canonical URL, sitemap entry and JSON-LD id is built from this.
// Hard-coded on purpose: www.ollieml.com is the canonical domain (middleware 308s ollie.ml, www.ollie.ml and bare ollieml.com to it). An old NEXT_PUBLIC_SITE_URL build variable must not override it.
export const SITE_URL = "https://www.ollieml.com"

// Last real content change to / and /match. Used by the sitemap and the /match dateModified schema.
export const HOME_UPDATED = "2026-09-24"

// Version of the Terms + Privacy Policy a user agrees to at signup (their "Last updated" date).
// Bump it whenever either page changes materially; it's stored with each user's consent.
export const TERMS_VERSION = "2026-09-24"

// Google Analytics 4. Loaded on every page from app/layout.tsx (and by hand in public/chemistry.html).
export const GA_ID = "G-Y0XQVZLSTL"

