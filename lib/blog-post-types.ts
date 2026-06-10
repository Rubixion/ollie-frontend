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
  date: string
  isoDate: string
  readTime: string
  category: string
  author: string
  keywords: string[]
  sections: Section[]
  faqs: FAQ[]
  relatedSlugs: string[]
}
