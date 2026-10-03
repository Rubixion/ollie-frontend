"use client"

// A saved outfit drawn the same way as the /ai-stylist preview: the model photo with the clothes layers stacked on top.
import { useEffect, useState } from "react"
import { layers, modelPhoto, body, type Assets } from "@/lib/style/model"
import type { SavedLook } from "@/lib/style/saved"

let index: Promise<Assets> | null = null // one fetch of the layer list per page
const loadIndex = () => (index ??= fetch("/style/layers/index.json").then((r) => r.json()).catch(() => ({ layers: {}, looks: {} })))

export function OutfitThumb({ look, className = "" }: { look: SavedLook; className?: string }) {
  const [assets, setAssets] = useState<Assets>()
  useEffect(() => { loadIndex().then(setAssets) }, [])
  const u = (src: string) => (assets?.v ? `${src}?v=${assets.v}` : src)
  const stack = assets ? layers(look.gender, look.build, look.outfit, assets.layers[body(look.gender, look.build)] ?? []) : []
  return (
    <div className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-b from-[#aea296] to-[#bbafa5] ${className}`}>
      {assets && <>
        {/* eslint-disable-next-line @next/next/no-img-element -- static model photo */}
        <img src={u(modelPhoto(look.gender, look.build, look.lookId))} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
        {stack.map((l) => (
          // eslint-disable-next-line @next/next/no-img-element -- clothes layer
          <img key={l.slot} src={u(l.src)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover"
            style={l.mask ? { maskImage: `url(${u(l.mask)})`, WebkitMaskImage: `url(${u(l.mask)})`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" } : undefined} />
        ))}
      </>}
    </div>
  )
}
