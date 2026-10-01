// Gemini image generation/editing, shared by the /ai-stylist try-on routes. The API call itself is in lib/image-gen.mjs
// (Vertex AI when VERTEX_API_KEY is set, so the Google Cloud credits pay; otherwise AI Studio with GEMINI_API_KEY).
import { generateImage } from "./image-gen.mjs"
export type Img = { mime_type: string; data: string } // base64

/** Text + images in, one image out. Throws with a user-safe message on failure. */
export async function geminiImage(text: string, images: Img[]): Promise<Img> {
  if (!process.env.VERTEX_API_KEY && !process.env.GEMINI_API_KEY) throw new Error("Previews are not configured yet.")
  try {
    return await generateImage({ text, images })
  } catch (e) {
    console.error("gemini:", (e as Error).message)
    throw new Error((e as Error).message === "no image returned"
      ? "The model didn't return an image. Try a different combination."
      : "The preview failed. Please try again.")
  }
}

/** A file from /public as a model input (product photos, model photos). null if it isn't there. */
export async function publicImage(origin: string, path: string): Promise<Img | null> {
  try {
    const r = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(6000) })
    const mime = r.headers.get("content-type")?.split(";")[0] ?? ""
    if (!r.ok || !/^image\/(jpeg|png|webp)$/.test(mime)) return null
    return { mime_type: mime, data: Buffer.from(await r.arrayBuffer()).toString("base64") }
  } catch {
    return null
  }
}

/** Product photos for the picked items (public/style/products/<id>.jpg), in the same order; missing ones skipped. */
export async function productPhotos(origin: string, ids: string[]): Promise<Img[]> {
  const imgs = await Promise.all(ids.map((id) => publicImage(origin, `/style/products/${id}.jpg`)))
  return imgs.filter((i): i is Img => i !== null)
}

export const REF_NOTE = "The extra images after the photo show the exact products: copy their cut, colour, fabric, logos and details exactly."
