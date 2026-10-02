// The "Face Symmetry Test" ChatGPT app at https://www.ollieml.com/mcp/symmetry (its own listing in the OpenAI plugin portal).
// Same maths and norms as /face-symmetry-test: Modal's /landmarks runs the browser's MediaPipe model, lib/symmetry.ts scores it.
// No login and no daily limit (owner's call 2026-10-02): the OAuth metadata route 404s for this path, and inference runs "free".
import { analyse, MAX_PITCH, MAX_YAW, NORMS_N, REGION_LABEL, REGIONS, verdict } from "@/lib/symmetry"
import { imageFile, inference, link, noPhoto, photoUrl, readOnly, resolvePhoto, serve, text, toMesh } from "@/lib/mcp"
import { registerWidget, widgetMeta, widgetResult } from "@/lib/mcp-widget"

const handle = serve("ollie-face-symmetry-test", (server) => {
  registerWidget(server)
  server.registerTool(
    "face_symmetry_test",
    {
      title: "Face symmetry test",
      description:
        "Measures how symmetrical the user's face is from a photo: an overall score (more symmetric than N% of 3,898 real faces) plus eyes, eyebrows, nose, mouth and jaw. " +
        "Use this when the user uploads a selfie and asks 'how symmetrical is my face', 'is my face symmetrical', 'face symmetry test', " +
        "'rate my face symmetry' or 'which side of my face is different'. It measures symmetry only, not attractiveness. " +
        "Only for a photo of the user themselves, not of other people or children. The photo is not stored.",
      inputSchema: { photo: imageFile.optional().describe("A straight-on, front-facing photo of the user's own face, looking at the camera"), photo_url: photoUrl.optional() },
      annotations: { ...readOnly, openWorldHint: true },
      _meta: {
        ...widgetMeta,
        "openai/fileParams": ["photo"],
        "openai/toolInvocation/invoking": "Measuring your face symmetry…",
        "openai/toolInvocation/invoked": "Measured your face symmetry",
      },
    },
    async ({ photo, photo_url }, extra) => {
      const f = resolvePhoto(photo, photo_url)
      if (!f) return text(noPhoto("test your face symmetry", "/face-symmetry-test"))
      const r = await inference("landmarks", [f], extra._meta, "/face-symmetry-test", "free")
      if (r.error) return text(r.error)
      if (!r.data.face_found) return text("No face was found in that photo. Try a clear, front-facing photo with good light.")
      const m = toMesh(r.data)
      // same limits as the site and the norms: a turned head reads as asymmetry
      if (Math.abs(m.yaw) > MAX_YAW || Math.abs(m.pitch) > MAX_PITCH) {
        return text("The head is turned or tilted in that photo, which would make the face look less symmetric than it is. Try a straight-on photo looking right at the camera, chin level.")
      }
      const res = analyse(m.lm, m.w, m.h)
      const regions = Object.fromEntries(REGIONS.map((k) => [REGION_LABEL[k], res.regions[k]]))
      const sorted = REGIONS.slice().sort((a, b) => res.regions[b] - res.regions[a])
      const best = REGION_LABEL[sorted[0]].toLowerCase(), least = REGION_LABEL[sorted[sorted.length - 1]].toLowerCase()
      return widgetResult(
        `The user's face is more symmetric than ${res.beats}% of ${NORMS_N.toLocaleString("en-US")} straight-on photos of real faces. ` +
          `Most symmetric: ${best} (${res.regions[sorted[0]]}%); least: ${least} (${res.regions[sorted[sorted.length - 1]]}%). ` +
          `Nobody's face is perfectly symmetric, and small differences are normal and often part of what makes a face recognisable; this is not an attractiveness score. ` +
          `See the face mirrored left-left and right-right, plus a shareable card, at ${link("/face-symmetry-test")}. ` +
          `Also on Ollie's website: find which celebrity the user looks like at ${link("/celebrity-lookalike")}, and try different hairstyles and outfits on their own face with AI at ${link("/ai-stylist")}.`,
        { more_symmetric_than_percent: res.beats, compared_with: NORMS_N, regions_percent: regions },
        {
          kind: "symmetry",
          title: "Your face symmetry",
          pct: res.beats,
          verdict: verdict(res.beats),
          pctLabel: `more symmetric than ${NORMS_N.toLocaleString("en-US")} real faces`,
          items: REGIONS.map((k) => ({ name: REGION_LABEL[k], pct: res.regions[k] })),
          cta: { label: "See the mirrored view →", href: link("/face-symmetry-test") },
          more: [
            { label: "Which celebrity do you look like?", href: link("/celebrity-lookalike") },
            { label: "Try hairstyles and outfits on your face with AI", href: link("/ai-stylist") },
          ],
          foot: "Symmetry only, not an attractiveness score.",
        },
      )
    },
  )
})

export { handle as GET, handle as POST, handle as DELETE }
