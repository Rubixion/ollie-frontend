// One-off: generate the two fictional base models for the free /style try-on with Gemini.
// Usage (from ollie-frontend): node scripts/style-model-photos.mjs [male|female]
// Reads GEMINI_API_KEY (and STYLE_IMAGE_MODEL) from the environment or .env.local. Writes public/style/models/<gender>.jpg.
// Re-run until you like the result, then commit the images. Bump VERSION in app/api/style-model/route.ts after replacing one.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"

const env = Object.fromEntries(
  (() => { try { return readFileSync(".env.local", "utf8") } catch { return "" } })()
    .split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
)
const KEY = process.env.GEMINI_API_KEY ?? env.GEMINI_API_KEY
const MODEL = process.env.STYLE_IMAGE_MODEL ?? env.STYLE_IMAGE_MODEL ?? "gemini-3.1-flash-image"
if (!KEY) throw new Error("Set GEMINI_API_KEY in .env.local first")

const common = "Photorealistic full-body fashion e-commerce photo, shot on a 50mm lens at eye level. Standing straight, facing the camera, " +
  "arms relaxed at the sides slightly away from the body, feet hip-width apart, neutral friendly expression. The whole body from the top " +
  "of the head to the feet is in frame with some space around it. Soft, even studio lighting, plain light warm-grey seamless backdrop, " +
  "no props, no text, no logos. Portrait orientation, 3:4. A fictional person, not anyone real."
const PROMPTS = {
  male: `A fictional adult male model in his mid-20s, average athletic build, short neat dark brown hair, clean-shaven. Wearing a plain fitted white crew-neck t-shirt, slim mid-grey chino trousers and plain white low-top sneakers. ${common}`,
  female: `A fictional adult female model in her mid-20s, average build, shoulder-length dark brown hair tied back. Wearing a plain fitted white crew-neck t-shirt, slim mid-grey trousers and plain white low-top sneakers. ${common}`,
}

function findImage(x) {
  if (!x || typeof x !== "object") return null
  if (x.type === "image" && (x.data || x.uri)) return x
  for (const v of Object.values(x)) { const h = findImage(v); if (h) return h }
  return null
}

mkdirSync("public/style/models", { recursive: true })
for (const g of process.argv[2] ? [process.argv[2]] : Object.keys(PROMPTS)) {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "x-goog-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, store: false, input: [{ type: "text", text: PROMPTS[g] }], response_format: { type: "image", mime_type: "image/jpeg" } }),
  })
  if (!res.ok) throw new Error(`${g}: ${res.status} ${(await res.text()).slice(0, 300)}`)
  const img = findImage(await res.json())
  if (!img) throw new Error(`${g}: no image returned`)
  const data = img.data ?? Buffer.from(await (await fetch(img.uri, { headers: { "x-goog-api-key": KEY } })).arrayBuffer()).toString("base64")
  writeFileSync(`public/style/models/${g}.jpg`, Buffer.from(data, "base64"))
  console.log(`wrote public/style/models/${g}.jpg`)
}
