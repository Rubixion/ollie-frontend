// Data for the hidden /look-alike pages, made by neural network learning/celeb_v2/look_alike_pages.py
// (one entry per celebrity with real "<name> look alike" search volume; rerun it after an index rebuild).
import data from "./look-alike-data.json"

export type Credit = { author: string; license: string; license_url: string; page: string }
export type LookAlikeMatch = { name: string; slug: string; knownFor: string; score: number; img: number; credit: Credit; hasPage: boolean }
export type LookAlikePage = {
  name: string
  slug: string
  volume: number
  knownFor: string
  category: string
  gender: string
  photos: number
  img: number
  credit: Credit
  matches: LookAlikeMatch[]
  alsoIn: string[]
}

export const lookAlikePages = data.pages as LookAlikePage[]
const bySlug = new Map(lookAlikePages.map((p) => [p.slug, p]))
export const getLookAlike = (slug: string) => bySlug.get(slug)

export const imgSrc = (i: number) => `/look-alike/img/${i}.webp`

// ponytail: same stretch as scale() in components/celebrity-finder.tsx (a client file, so it can't be imported here);
// change both together. Capped at 99: two different people are never shown as 100%.
const RAW_LO = 30, RAW_HI = 41.7, OUT_LO = 20, OUT_HI = 80
export const shown = (raw: number) => Math.round(Math.max(0, Math.min(99, OUT_LO + ((raw - RAW_LO) * (OUT_HI - OUT_LO)) / (RAW_HI - RAW_LO))))

// "American actress (born 1990)" -> "American actress"
export const role = (knownFor: string) => knownFor.replace(/\s*\(.*?\)\s*/g, " ").trim() || "celebrity"

