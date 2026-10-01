// Gemini image generation/editing (Interactions API), shared by the /style try-on routes.
const MODEL = process.env.STYLE_IMAGE_MODEL ?? "gemini-3.1-flash-image"
export type Img = { mime_type: string; data: string } // base64

// The Interactions API nests the image under steps[].content[] (or output_image); find it wherever it is.
function findImage(x: unknown): { data?: string; uri?: string; mime_type?: string } | null {
  if (!x || typeof x !== "object") return null
  const o = x as Record<string, unknown>
  if (o.type === "image" && (typeof o.data === "string" || typeof o.uri === "string")) return o
  for (const v of Object.values(o)) {
    const hit = findImage(v)
    if (hit) return hit
  }
  return null
}

/** Text + images in, one JPEG out. Throws with a user-safe message on failure. store:false = Google keeps nothing. */
export async function geminiImage(text: string, images: Img[]): Promise<Img> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error("Previews are not configured yet.")
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      store: false,
      input: [{ type: "text", text }, ...images.map((i) => ({ type: "image", ...i }))],
      response_format: { type: "image", mime_type: "image/jpeg" },
    }),
    signal: AbortSignal.timeout(120_000),
  })
  if (!res.ok) {
    console.error("gemini:", res.status, (await res.text()).slice(0, 500))
    throw new Error("The preview failed. Please try again.")
  }
  const img = findImage(await res.json())
  if (!img) throw new Error("The model didn't return an image. Try a different combination.")
  let data = img.data
  if (!data && img.uri) data = Buffer.from(await (await fetch(img.uri, { headers: { "x-goog-api-key": key } })).arrayBuffer()).toString("base64")
  return { mime_type: img.mime_type ?? "image/jpeg", data: data! }
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
