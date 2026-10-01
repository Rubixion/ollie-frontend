// In-body link for blog post paragraphs, same look as the hand-written links in blog-posts-{a,b,c}.ts.
export const a = (href: string, text: string) =>
  `<a href="${href}" class="text-(--ollie-cyan) underline underline-offset-4 hover:text-white">${text}</a>`
