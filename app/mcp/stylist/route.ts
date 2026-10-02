// The "Ollie Stylist" ChatGPT app at https://www.ollieml.com/mcp/stylist (its own listing in the OpenAI plugin portal).
// Same rules as /ai-stylist: face shape from the MediaPipe mesh (lib/style/face-shape.ts), picks from lib/style/editor.ts.
// Product links are Amazon affiliate searches (NEXT_PUBLIC_AMAZON_TAG), disclosed in every answer.
// ponytail: haircuts, glasses and beards only; clothing picks need the style quiz, so they stay on /ai-stylist.
import { z } from "zod"
import { classify, measure, SHAPE_INFO, type Shape, type ShapeResult } from "@/lib/style/face-shape"
import { cards } from "@/lib/style/editor"
import { fitNotes, shapeLabel, want, type Answers } from "@/lib/style/recommend"
import { imageFile, inference, link, noPhoto, photoBase64, photoUrl, readOnly, resolvePhoto, serve, text, toMesh } from "@/lib/mcp"
import { registerWidget, widgetMeta, widgetResult } from "@/lib/mcp-widget"

const SHAPES = ["oval", "round", "square", "oblong", "heart", "diamond", "triangle"] as const
const DISCLOSURE = "Product links are affiliate links: Ollie may earn a commission at no extra cost to the user."

const about = {
  gender: z.enum(["male", "female", "other"]).optional().describe("Only if the user said it"),
  age: z.number().int().min(13).max(100).optional(),
  hair_texture: z.enum(["straight", "wavy", "curly", "coily"]).optional(),
  hairline: z.enum(["full", "high", "slight", "receding", "thinning", "bald"]).optional(),
  goal: z.enum(["older", "younger", "sharper", "softer", "low-effort", "stand-out", "keep"]).optional().describe("How they want to come across"),
  height_cm: z.number().min(120).max(230).optional(),
  build: z.enum(["slim", "average", "athletic", "broad", "bigger"]).optional(),
}
type About = { [K in keyof typeof about]?: z.infer<(typeof about)[K]> }

const answers = (x: About): Answers => ({
  gender: x.gender, age: x.age, texture: x.hair_texture, hairline: x.hairline, goal: x.goal, height: x.height_cm, build: x.build,
})

// A shape the user told us: all weight on it (second is only used for the "close to" label, which needs a real gap).
const given = (shape: Shape): ShapeResult => {
  const probs = Object.fromEntries(SHAPES.map((s) => [s, s === shape ? 1 : 0])) as Record<Shape, number>
  return { shape, second: SHAPES.find((s) => s !== shape)!, confidence: 1, probs, z: [0, 0, 0, 0] }
}

function advice(s: ShapeResult, a: Answers, intro: string) {
  const hair = cards("hair", a, s).slice(0, 3).map((c) => ({
    name: c.name, why: c.why ?? c.sub, ask_the_barber: c.cut!.ask, styling: c.cut!.styling, trim_every_weeks: c.cut!.weeks, products: c.links,
  }))
  const glasses = cards("glasses", a, s).filter((c) => c.best).map((c) => ({ name: c.name, why: c.sub, shop: c.links[0]?.href }))
  const beard = (want(a) ?? 0) > 0 ? cards("beard", a, s).filter((c) => c.best).map((c) => ({ name: c.name, why: c.why ?? c.sub })) : []
  const fit = fitNotes(a)
  const lines = [
    intro,
    `Best haircuts: ${hair.map((h, i) => `${i + 1}. ${h.name} (${h.why}). Ask for: ${h.ask_the_barber}`).join(" ")}`,
    glasses.length ? `Glasses that suit it: ${glasses.map((g) => g.name).join(", ")}.` : "",
    beard.length ? `Beard: ${beard.map((b) => b.name).join(" or ")}.` : "",
    fit.length ? `Fit: ${fit.join(" ")}` : "",
    `Try these looks on the user's own photo (free) at ${link("/ai-stylist")}. ${DISCLOSURE}`,
  ]
  const sections = [
    { title: "Best haircuts", items: hair.map((h) => `${h.name} — ${h.why}`) },
    glasses.length ? { title: "Glasses", items: glasses.map((g) => g.name) } : null,
    beard.length ? { title: "Beard", items: beard.map((b) => b.name) } : null,
    fit.length ? { title: "Fit", items: fit } : null,
  ].filter(Boolean)
  return widgetResult(
    lines.filter(Boolean).join("\n\n"),
    { face_shape: s.shape, haircuts: hair, glasses, beard, fit_notes: fit, try_on: link("/ai-stylist") },
    {
      kind: "stylist",
      title: "Your style guide",
      shape: s.shape,
      shapeInfo: intro,
      sections,
      cta: { label: "Try these on your photo →", href: link("/ai-stylist") },
      foot: DISCLOSURE,
    },
  )
}

const handle = serve("ollie-stylist", (server, auth) => {
  registerWidget(server)
  server.registerTool(
    "haircut_for_face_shape",
    {
      title: "Best haircut for my face shape",
      description:
        "Recommends the 3 best haircuts for a face shape the user names (with exactly what to ask the barber or stylist and how to style it), plus glasses frames, beard styles and clothing fit notes. " +
        "Use this when the user asks 'what haircut suits a round face', 'best haircut for an oval face', 'haircuts for a square face men', " +
        "'what glasses suit a heart shaped face' or 'which hairstyle suits my face shape' and already knows their face shape. No photo needed.",
      inputSchema: { face_shape: z.enum(SHAPES), ...about },
      annotations: readOnly,
      _meta: { ...widgetMeta, "openai/toolInvocation/invoking": "Picking haircuts…", "openai/toolInvocation/invoked": "Picked haircuts" },
    },
    async ({ face_shape, ...x }) => advice(given(face_shape), answers(x), `For ${/^[aeiou]/.test(face_shape) ? "an" : "a"} ${face_shape} face: ${SHAPE_INFO[face_shape]}`),
  )

  server.registerTool(
    "face_shape_and_haircut",
    {
      title: "What is my face shape? Haircuts that suit me",
      description:
        "Finds the user's face shape from their photo (oval, round, square, oblong, heart, diamond or triangle), then recommends the 3 best haircuts, glasses and beard styles for it. " +
        "Use this when the user uploads a selfie and asks 'what is my face shape', 'what haircut would suit me', 'what hairstyle suits my face', " +
        "'what glasses suit my face' or 'how should I change my look'. Only for a photo of the user themselves, not of other people or children. The photo is not stored.",
      inputSchema: { photo: imageFile.optional().describe("A straight-on photo of the user's own face, hair pulled back from the face if possible"), photo_url: photoUrl.optional(), photo_base64: photoBase64.optional(), ...about },
      annotations: { ...readOnly, openWorldHint: true },
      _meta: {
        ...widgetMeta,
        "openai/fileParams": ["photo"],
        "openai/toolInvocation/invoking": "Measuring your face shape…",
        "openai/toolInvocation/invoked": "Found your face shape",
      },
    },
    async ({ photo, photo_url, photo_base64, ...x }, extra) => {
      const f = resolvePhoto(photo, photo_url, photo_base64)
      if (!f) return text(noPhoto("find your face shape and the styles that suit it", "/ai-stylist"))
      const r = await inference("landmarks", [f], extra._meta, "/ai-stylist", auth)
      if (r.error) return text(r.error)
      if (!r.data.face_found) return text("No face was found in that photo. Try a clear, front-facing photo with good light.")
      const m = toMesh(r.data)
      // ponytail: same straight-on limit as the symmetry norms; the site's live scan averages many frames instead
      if (Math.abs(m.yaw) > 12 || Math.abs(m.pitch) > 15) {
        return text("The head is turned in that photo, which skews the face's proportions. Try a straight-on photo looking at the camera.")
      }
      const s = classify(measure(m.lm, m.w, m.h))
      return advice(s, answers(x), `The user's face shape is ${shapeLabel(s)}: ${SHAPE_INFO[s.shape]} (From one photo; hair covering the forehead or jaw can shift it.)`)
    },
  )
})

export { handle as GET, handle as POST, handle as DELETE }
