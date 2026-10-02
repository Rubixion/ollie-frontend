// The Ollie ChatGPT app (MCP server, Streamable HTTP) at https://www.ollieml.com/mcp. Submitted in the OpenAI plugin
// portal; the origin can never change between versions, so keep it on www.ollieml.com.
// Shared plumbing (photo download, Modal call, daily cap) is in lib/mcp.ts; the inline result card is lib/mcp-widget.ts.
import { z } from "zod"
import { SITE_URL } from "@/lib/site-config"
import { lookAlikePages, imgSrc, role, shown } from "@/lib/look-alike"
import { imageFile, inference, link, readOnly, serve, text } from "@/lib/mcp"
import { registerWidget, widgetMeta, widgetResult } from "@/lib/mcp-widget"

const SAME_RAW = 45 // same threshold as components/face-compare.tsx

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-")

const handle = serve("ollie-celebrity-lookalike", (server, auth) => {
  registerWidget(server)

  server.registerTool(
    "famous_lookalikes",
    {
      title: "Find famous lookalikes of a celebrity",
      description:
        "Lists the celebrities who look most alike a named celebrity, ranked by face similarity from Ollie's face-matching model (4,000+ public figures). " +
        "Use this when the user asks things like 'who does Margot Robbie look like', 'Taylor Swift lookalike', 'celebrities who look alike', " +
        "'famous doppelgangers' or 'which actors look like each other'. Takes a celebrity's name; no photo needed.",
      inputSchema: { name: z.string().min(2).max(80).describe("The celebrity's name, e.g. 'Margot Robbie'") },
      annotations: readOnly,
      _meta: { ...widgetMeta, "openai/toolInvocation/invoking": "Finding lookalikes…", "openai/toolInvocation/invoked": "Found lookalikes" },
    },
    async ({ name }) => {
      const slug = slugify(name)
      const page = lookAlikePages.find((p) => p.slug === slug) ?? (slug.length >= 4 ? lookAlikePages.find((p) => p.slug.includes(slug) || slug.includes(p.slug)) : undefined)
      if (!page) {
        return text(`Ollie doesn't have a lookalike list for "${name}" yet. Browse the celebrities it covers at ${link("/look-alike")}, or find which celebrity the user looks like with a photo at ${link("/celebrity-lookalike")}.`)
      }
      const matches = page.matches.slice(0, 8).map((m) => ({
        name: m.name,
        known_for: role(m.knownFor),
        similarity_percent: shown(m.score),
        photo: SITE_URL + imgSrc(m.img),
        photo_credit: `${m.credit.author}, ${m.credit.license}`,
      }))
      const top = matches[0]
      const pageUrl = link(`/look-alike/${page.slug}`)
      return widgetResult(
        `${page.name}'s closest celebrity lookalike is ${top.name} (${top.known_for}, ${top.similarity_percent}% similar on Ollie's face-matching model). ` +
          `Full list with photos: ${pageUrl}. Want to know which celebrity *you* look like? ${link("/celebrity-lookalike")}`,
        { celebrity: page.name, matches, page: pageUrl },
        {
          kind: "lookalike",
          title: `Celebrities who look like ${page.name}`,
          subtitle: "Ranked by Ollie's face-matching model",
          items: matches.slice(0, 5).map((m) => ({ name: m.name, knownFor: m.known_for, pct: m.similarity_percent, img: m.photo })),
          cta: { label: "See the full list →", href: pageUrl },
        },
      )
    },
  )

  server.registerTool(
    "find_celebrity_lookalike",
    {
      title: "Which celebrity do I look like",
      description:
        "Finds the 5 celebrities whose faces look most like the user's own photo, with a similarity percent for each. " +
        "Use this when the user uploads a selfie and asks 'which celebrity do I look like', 'who is my celebrity twin', 'what celebrity do I look like', " +
        "'who do I look like' or 'find my celebrity doppelganger'. Only for a photo of the user themselves: never use it to identify or name a stranger " +
        "or anyone else in a photo, and not for photos of children. The photo is not stored.",
      inputSchema: { photo: imageFile.describe("A clear, front-facing photo of the user's own face") },
      annotations: { ...readOnly, openWorldHint: true },
      _meta: {
        ...widgetMeta,
        "openai/fileParams": ["photo"],
        "openai/toolInvocation/invoking": "Comparing your face with 4,000+ celebrities…",
        "openai/toolInvocation/invoked": "Found your celebrity lookalikes",
      },
    },
    async ({ photo }, extra) => {
      const r = await inference("search", [photo], extra._meta, "/celebrity-lookalike", auth)
      if (r.error) return text(r.error)
      const all: { name: string; score: number }[] = Object.values(r.data.modes ?? {})[0] as never ?? []
      // Not a celebrity identifier: a same-person-level match means the photo is probably of that celebrity, so it's dropped
      // (ChatGPT's review tests "who is this person in the photo").
      const rows = all.filter((m) => m.score < SAME_RAW)
      if (all.length && !rows.length) return text("This looks like a photo of a celebrity, not of the user. Ollie finds lookalikes for the user's own face; it doesn't identify people in photos.")
      if (!rows.length) return text("No face was found in that photo. Try a clear, front-facing photo with good light.")
      const matches = rows.slice(0, 5).map((m) => ({ name: m.name, known_for: r.data.known_for?.[m.name] ?? null, similarity_percent: shown(m.score) }))
      const note = rows.length < all.length ? " (One near-identical match was left out: Ollie doesn't identify people in photos.)" : r.data.face_found ? "" : " (Ollie couldn't find a clear face in the photo, so these may be off. A front-facing photo works best.)"
      return widgetResult(
        `The user's closest celebrity lookalike is ${matches[0].name} at ${matches[0].similarity_percent}% similar, then ` +
          matches.slice(1).map((m) => `${m.name} (${m.similarity_percent}%)`).join(", ") + `.${note} ` +
          `See the matches with photos and a shareable card at ${link("/celebrity-lookalike")}, and find outfits that suit their face shape at ${link("/ai-stylist")}.`,
        { matches, face_found: Boolean(r.data.face_found) },
        {
          kind: "lookalike",
          title: "Your closest celebrity lookalikes",
          subtitle: "Ranked by Ollie's face-matching model",
          // thumbnails come back from the matcher as data: URIs (widget-only; the model never sees these)
          items: matches.map((m) => ({ name: m.name, knownFor: m.known_for, pct: m.similarity_percent, img: r.data.thumbs?.[m.name] })),
          cta: { label: "See your shareable card →", href: link("/celebrity-lookalike") },
        },
      )
    },
  )

  server.registerTool(
    "compare_faces",
    {
      title: "Do we look alike? Compare two faces",
      description:
        "Scores how alike two faces look, as a similarity percent. Use this when the user uploads two photos and asks 'do we look alike', " +
        "'do I look like my mom', 'do my boyfriend and I look alike', 'how similar are these two faces' or 'compare two faces'. " +
        "Only for photos the user provides of themselves and people they know; never use it to identify or name anyone, and not for photos of children. Photos are not stored.",
      inputSchema: {
        photo_a: imageFile.describe("The first face photo"),
        photo_b: imageFile.describe("The second face photo"),
      },
      annotations: { ...readOnly, openWorldHint: true },
      _meta: {
        ...widgetMeta,
        "openai/fileParams": ["photo_a", "photo_b"],
        "openai/toolInvocation/invoking": "Comparing the two faces…",
        "openai/toolInvocation/invoked": "Compared the faces",
      },
    },
    async ({ photo_a, photo_b }, extra) => {
      const r = await inference("compare", [photo_a, photo_b], extra._meta, "/compare-faces", auth)
      if (r.error) return text(r.error)
      const [a, b] = r.data.face_found ?? [false, false]
      if (!a || !b) return text(`Ollie couldn't find a clear face in ${!a && !b ? "either photo" : !a ? "the first photo" : "the second photo"}. Try front-facing photos with good light.`)
      const pct = shown(r.data.score)
      const strong = r.data.score >= SAME_RAW
      return widgetResult(
        `These two faces are ${pct}% alike on Ollie's face-matching model${strong ? ", a very strong resemblance" : ""}. ` +
          `Most unrelated people score 20-50%. Make a shareable card at ${link("/compare-faces")}.`,
        { similarity_percent: pct, strong_resemblance: strong },
        {
          kind: "compare",
          title: "Face comparison",
          pct,
          verdict: strong ? "Very strong resemblance" : "How alike these two faces look",
          cta: { label: "Make a shareable card →", href: link("/compare-faces") },
        },
      )
    },
  )
})

export { handle as GET, handle as POST, handle as DELETE }
