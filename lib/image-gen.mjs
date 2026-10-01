// One Gemini image call (text + images in, one image out), shared by lib/gemini.ts and the scripts/style-*.mjs scripts.
// Vertex AI when VERTEX_API_KEY is set: billed to Google Cloud, so the free-trial credits pay for it (AI Studio isn't covered).
// Otherwise the AI Studio key (GEMINI_API_KEY, prepaid balance). Neither stores or trains on the images.
// Plain JS so the node scripts can import it too.

/** @param {{ text: string, images?: { mime_type: string, data: string }[], env?: Record<string, string | undefined>, timeoutMs?: number }} o
 *  @returns {Promise<{ mime_type: string, data: string }>} base64 image */
export async function generateImage({ text, images = [], env = process.env, timeoutMs = 120_000 }) {
  const model = env.STYLE_IMAGE_MODEL || "gemini-3.1-flash-image"
  const signal = AbortSignal.timeout(timeoutMs) // covers retries too

  if (env.VERTEX_API_KEY) {
    const call = () => fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": env.VERTEX_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text }, ...images.map((i) => ({ inlineData: { mimeType: i.mime_type, data: i.data } }))] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { imageOutputOptions: { mimeType: "image/jpeg" } } },
      }),
      signal,
    })
    let res = await call()
    // Vertex shares preview-model capacity, so 429s come in bursts: wait and retry (only matters for batch scripts)
    for (let wait = 15_000; res.status === 429 && wait <= 240_000 && !signal.aborted; wait *= 2) {
      await new Promise((r) => setTimeout(r, wait))
      res = await call()
    }
    if (!res.ok) throw new Error(`vertex ${res.status}: ${(await res.text()).slice(0, 500)}`)
    const parts = (await res.json()).candidates?.[0]?.content?.parts ?? []
    const img = parts.find((p) => p.inlineData?.data)?.inlineData
    if (!img) throw new Error("no image returned")
    return { mime_type: img.mimeType ?? "image/jpeg", data: img.data }
  }

  if (!env.GEMINI_API_KEY) throw new Error("no image key configured")
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "x-goog-api-key": env.GEMINI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      model, store: false,
      input: [{ type: "text", text }, ...images.map((i) => ({ type: "image", ...i }))],
      response_format: { type: "image", mime_type: "image/jpeg" },
    }),
    signal,
  })
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 500)}`)
  const img = findImage(await res.json())
  if (!img) throw new Error("no image returned")
  const data = img.data ?? Buffer.from(await (await fetch(img.uri, { headers: { "x-goog-api-key": env.GEMINI_API_KEY } })).arrayBuffer()).toString("base64")
  return { mime_type: img.mime_type ?? "image/jpeg", data }
}

// The Interactions API nests the image under steps[].content[] (or output_image); find it wherever it is.
function findImage(x) {
  if (!x || typeof x !== "object") return null
  if (x.type === "image" && (x.data || x.uri)) return x
  for (const v of Object.values(x)) { const h = findImage(v); if (h) return h }
  return null
}

/** Reads KEY=value lines from .env.local (for the node scripts; Next loads it on its own). */
export async function scriptEnv() {
  const { readFileSync } = await import("node:fs")
  let text = ""
  try { text = readFileSync(".env.local", "utf8") } catch {}
  const file = Object.fromEntries(text.split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]))
  return { ...file, ...process.env }
}
