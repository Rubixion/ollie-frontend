// usage: node comp.mjs <body> <look> <out.jpg> id1 id2 ... (bottom-first order)
import sharp from "sharp"
const [body, look, out, ...ids] = process.argv.slice(2)
const base = `public/style/models/${body}-${look}.jpg`
const { width, height } = await sharp(base).metadata()
const layers = await Promise.all(ids.map(async (id) => ({ input: await sharp(`public/style/layers/${body}/${id}.webp`).resize(width, height, { fit: "fill" }).png().toBuffer() })))
await sharp(await sharp(base).composite(layers).png().toBuffer()).resize(600).jpeg().toFile(out)
