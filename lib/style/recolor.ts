// Recolours a clothes layer to another of the product's real colours, in the browser: no image calls, no extra files.
// Works in CIE Lab: every garment pixel keeps its shading (its lightness offset from the garment's typical colour) but
// takes the new colour; pixels far from the garment's colour (logos, zips, buttons, stitching) are left as they are.
// ponytail: solid-colour garments only (catalogue items list `colors` only when that holds); denim, plaid and stripes
// would need their own render per colour.
"use client"

import { useEffect, useState } from "react"

type Lab = [number, number, number]
const lin = (c: number) => { c /= 255; return c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92 }
const gam = (c: number) => 255 * (c > 0.0031308 ? 1.055 * c ** (1 / 2.4) - 0.055 : 12.92 * c)
const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
const fi = (t: number) => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787)

export function toLab(r: number, g: number, b: number): Lab {
  const R = lin(r), G = lin(g), B = lin(b)
  const x = f((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047), y = f(R * 0.2126 + G * 0.7152 + B * 0.0722), z = f((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883)
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}
export function toRgb([L, a, b]: Lab): [number, number, number] {
  const y = (L + 16) / 116, x = a / 500 + y, z = y - b / 200
  const X = fi(x) * 0.95047, Y = fi(y), Z = fi(z) * 1.08883
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(gam(v))))
  return [c(X * 3.2406 - Y * 1.5372 - Z * 0.4986), c(-X * 0.9689 + Y * 1.8758 + Z * 0.0415), c(X * 0.0557 - Y * 0.204 + Z * 1.057)]
}
export const hexLab = (hex: string) => toLab(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16))

/** The garment's typical colour: the median L, a and b of its solid pixels (a logo or zip barely moves a median). */
export function garmentLab(px: Uint8ClampedArray | Uint8Array): Lab {
  const L: number[] = [], A: number[] = [], B: number[] = []
  for (let i = 0; i < px.length; i += 4 * 7) { // every 7th pixel is plenty
    if (px[i + 3] < 200) continue
    const [l, a, b] = toLab(px[i], px[i + 1], px[i + 2])
    L.push(l); A.push(a); B.push(b)
  }
  const med = (v: number[]) => (v.sort((x, y) => x - y), v[v.length >> 1] ?? 50)
  return [med(L), med(A), med(B)]
}

/** Recolours RGBA pixels in place, from the garment's own colour (measured, unless given) to `to`. */
export function recolorPixels(px: Uint8ClampedArray | Uint8Array, to: string, from: Lab = garmentLab(px)) {
  const [L0, a0, b0] = from, [L1, a1, b1] = hexLab(to)
  // shading lives in a narrow band at the light and dark ends: stretch it when leaving them, squeeze it when entering
  const room = (L: number) => Math.max(8, Math.min(L, 100 - L))
  const k = Math.min(2.5, room(L1) / room(L0))
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 64) continue // faint leftovers of the backdrop: invisible as they are, visible once recoloured
    const [L, a, b] = toLab(px[i], px[i + 1], px[i + 2])
    if (Math.hypot(a - a0, b - b0) > 26 || Math.abs(L - L0) > 55) continue // a logo, zip or button: keep it
    const [r, g, bl] = toRgb([L1 + (L - L0) * k, a1 + (a - a0) * 0.5, b1 + (b - b0) * 0.5])
    px[i] = r; px[i + 1] = g; px[i + 2] = bl
  }
}

// ─── browser: a recoloured copy of a layer image, as an object URL (cached per image + colour) ───
const cache = new Map<string, Promise<string>>()
export function recolored(src: string, to: string): Promise<string> {
  const key = `${src}|${to}`
  if (!cache.has(key)) cache.set(key, (async () => {
    const img = new Image()
    img.src = src
    await img.decode()
    const c = document.createElement("canvas")
    c.width = img.naturalWidth; c.height = img.naturalHeight
    const ctx = c.getContext("2d", { willReadFrequently: true })!
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, c.width, c.height)
    recolorPixels(data.data, to)
    ctx.putImageData(data, 0, 0)
    const blob = await new Promise<Blob>((ok) => c.toBlob((b) => ok(b!), "image/webp", 0.9))
    return URL.createObjectURL(blob)
  })())
  return cache.get(key)!
}

/** React: the layer's URL, recoloured to `tint` when one is given (the original shows until the copy is ready). */
export function useTinted(src: string, tint?: string) {
  const [out, setOut] = useState<{ key: string; url: string }>()
  const key = `${src}|${tint}`
  useEffect(() => { if (tint) recolored(src, tint).then((url) => setOut({ key, url })).catch(() => {}) }, [src, tint, key])
  return tint ? (out?.key === key ? out.url : undefined) : src
}
