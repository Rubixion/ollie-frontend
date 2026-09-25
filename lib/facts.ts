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
  // Rounded down to the thousand (owner's rule). v2 index, 2026-09-25: 5,955 people, 40,252 photos.
  celebrities: "5,000+",
  photos: "40,000+",
  photosPerPerson: "2 to 12",
  source: "Wikimedia Commons",
  // Gender (Wikidata), v2 index: 62% men, 37% women. /match and llms.txt say "about three in five ... are men".
}

// Must match the purge job in supabase/search_limits.sql.
export const SEARCH_LOG_DAYS = 90
