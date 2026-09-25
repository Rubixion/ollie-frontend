export type Section = {
  h2?: string
  paragraphs: string[]
}

export type FAQ = {
  q: string
  a: string
}

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  summary: string // 2-3 sentence answer shown under the title; carries the target keywords in the first 100 words
  date: string
  isoDate: string
  updatedIsoDate?: string // set when the content is revised (dateModified, sitemap lastmod)
  readTime: string
  category: string
  author: string
  keywords: string[]
  sections: Section[]
  faqs: FAQ[]
  relatedSlugs: string[]
}
