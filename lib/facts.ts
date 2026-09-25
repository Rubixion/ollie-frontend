// Facts quoted in page copy, metadata, JSON-LD, OG images and llms.txt. Keep them in one place:
// search engines and AI answer engines cross-check them, and a mismatch costs trust. (The domain is SITE_URL in site-config.ts.)
// public/llms.txt repeats these by hand: update it too.

export const OWNER = { name: "The Ollie team", email: "support@ollie.ml" }

export const MODEL = {
  summary: "a 20-layer convolutional neural network (SphereFace architecture) trained from scratch with CosFace loss",
  trainingSet: "MS1MV2, a dataset of 5.8 million face photos of 85,742 people",
  trainingTime: "about 10 days on one RTX 4060 Ti",
  lfw: "98.5%",
}

export const INDEX = {
  // Owner's call (2026-09-24): shown as "5,000+" site-wide; the index is going past 5,000 with the regional top-up.
  celebrities: "5,000+",
  photosPerPerson: "2 to 12",
  source: "Wikimedia Commons",
  // TODO(owner): /match and llms.txt say "roughly two-thirds ... are men" (Wikidata gender: 63% men among the first 479
  // collected, 66% across the 12,000 candidates). Recheck when the run finishes.
}

// Must match the purge job in supabase/search_limits.sql.
export const SEARCH_LOG_DAYS = 90
