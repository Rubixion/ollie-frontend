// Facts quoted in page copy, metadata, JSON-LD, OG images and llms.txt. Keep them in one place:
// search engines and AI answer engines cross-check them, and a mismatch costs trust. (The domain is SITE_URL in site-config.ts.)
// public/llms.txt repeats these by hand: update it too.

export const OWNER = { name: "The Ollie team", email: "lbrad@student.ubc.ca" }

export const MODEL = {
  summary: "a 20-layer convolutional neural network (SphereFace architecture) trained from scratch with CosFace loss",
  trainingSet: "MS1MV2, about 5.8 million photos of 85,742 people",
  trainingTime: "about 10 days on one RTX 4060 Ti",
  lfw: "98.5%",
}

export const INDEX = {
  // TODO(owner): confirm when the celeb_v2 run finishes. collect.py stops at 5,000 people with 3+ verified photos.
  celebrities: "5,000",
  photosPerPerson: "3 to 12",
  source: "Wikimedia Commons",
  // TODO(owner): /match and llms.txt say "roughly two-thirds ... are men" (Wikidata gender: 63% men among the first 479
  // collected, 66% across the 12,000 candidates). Recheck when the run finishes.
}

// Must match the purge job in supabase/search_limits.sql.
export const SEARCH_LOG_DAYS = 90
