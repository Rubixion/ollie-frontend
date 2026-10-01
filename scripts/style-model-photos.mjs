// One-off: generate the two fictional base models for the free /ai-stylist try-on with Gemini.
// Usage (from ollie-frontend): node scripts/style-model-photos.mjs [male|female]
// Reads VERTEX_API_KEY or GEMINI_API_KEY (and STYLE_IMAGE_MODEL) from the environment or .env.local. Writes public/style/models/<gender>.jpg.
// Re-run until you like the result, then commit the images. Bump VERSION in app/api/style-model/route.ts after replacing one.
import { writeFileSync, mkdirSync } from "node:fs"
import { generateImage, scriptEnv } from "../lib/image-gen.mjs"

const env = await scriptEnv()

const common = "Photorealistic full-body fashion e-commerce photo, shot on a 50mm lens at eye level. Standing straight, facing the camera, " +
  "arms relaxed at the sides slightly away from the body, feet hip-width apart, neutral friendly expression. The whole body from the top " +
  "of the head to the feet is in frame with some space around it. Soft, even studio lighting, plain light warm-grey seamless backdrop, " +
  "no props, no text, no logos. Portrait orientation, 3:4. A fictional person, not anyone real."
const PROMPTS = {
  male: `A fictional adult male model in his mid-20s, average athletic build, short neat dark brown hair, clean-shaven. Wearing a plain fitted white crew-neck t-shirt, slim mid-grey chino trousers and plain white low-top sneakers. ${common}`,
  female: `A fictional adult female model in her mid-20s, average build, shoulder-length dark brown hair tied back. Wearing a plain fitted white crew-neck t-shirt, slim mid-grey trousers and plain white low-top sneakers. ${common}`,
}

mkdirSync("public/style/models", { recursive: true })
for (const g of process.argv[2] ? [process.argv[2]] : Object.keys(PROMPTS)) {
  const img = await generateImage({ text: PROMPTS[g], env })
  const data = img.data
  writeFileSync(`public/style/models/${g}.jpg`, Buffer.from(data, "base64"))
  console.log(`wrote public/style/models/${g}.jpg`)
}
