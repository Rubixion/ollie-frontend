"use client"

// A saved outfit drawn the same way as the /ai-stylist preview: the model photo with the clothes layers stacked on top.
import { useEffect, useRef, useState } from "react"
import { handsLayer, layers, modelPhoto, body, type Assets, type Layer } from "@/lib/style/model"
import { useTinted } from "@/lib/style/recolor"
import { updateOutfit, type SavedLook } from "@/lib/style/saved"
import { Input } from "@/components/ui/input"

let index: Promise<Assets> | null = null // one fetch of the layer list per page
const loadIndex = () => (index ??= fetch("/style/layers/index.json").then((r) => r.json()).catch(() => ({ layers: {}, looks: {} })))

/** One clothes layer, recoloured in the browser when it has a tint. Hidden until the recoloured copy is ready. */
export function LayerImg({ l, u, lazy }: { l: Layer; u: (src: string) => string; lazy?: boolean }) {
  const src = useTinted(u(l.src), l.tint)
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element -- clothes layer (a blob URL when recoloured)
    <img src={src} alt="" loading={lazy ? "lazy" : undefined} className="absolute inset-0 size-full object-cover"
      style={l.mask ? { maskImage: `url(${u(l.mask)})`, WebkitMaskImage: `url(${u(l.mask)})`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" } : undefined} />
  )
}

export function OutfitThumb({ look, className = "" }: { look: SavedLook; className?: string }) {
  const [assets, setAssets] = useState<Assets>()
  useEffect(() => { loadIndex().then(setAssets) }, [])
  const u = (src: string) => (assets?.v ? `${src}?v=${assets.v}` : src)
  const stack = assets ? layers(look.gender, look.build, look.outfit, assets.layers[body(look.gender, look.build)] ?? [], look.tints) : []
  return (
    <div className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-b from-[#aea296] to-[#bbafa5] ${className}`}>
      {assets && <>
        {/* eslint-disable-next-line @next/next/no-img-element -- static model photo */}
        <img src={u(modelPhoto(look.gender, look.build, look.lookId))} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
        {stack.map((l) => <LayerImg key={l.slot} l={l} u={u} lazy />)}
        <LayerImg l={handsLayer(look.gender, look.build, look.lookId)} u={u} lazy />
      </>}
    </div>
  )
}

/** A saved outfit's title with a Rename button: Enter or leaving the field saves, Escape cancels. */
export function OutfitTitle({ id, name, onRenamed }: { id: string; name: string; onRenamed: (name: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  const cancelled = useRef(false)
  async function commit() {
    const next = cancelled.current ? "" : draft?.trim()
    cancelled.current = false
    setDraft(null)
    if (!next || next === name) return
    onRenamed(next.slice(0, 60))
    if (await updateOutfit(id, { name: next })) onRenamed(name) // failed: put the old title back
  }
  return draft === null ? (
    <div className="flex items-start justify-between gap-2 px-1">
      <span className="min-w-0 break-words text-sm font-semibold text-white">{name}</span>
      <button type="button" onClick={() => setDraft(name)} className="min-h-8 shrink-0 text-xs text-white/50 hover:text-white" aria-label={`Rename ${name}`}>Rename</button>
    </div>
  ) : (
    <Input autoFocus value={draft} maxLength={60} aria-label="Outfit title" onChange={(e) => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { cancelled.current = true; e.currentTarget.blur() } }}
      className="h-9 border-white/10 bg-black/35 text-white" />
  )
}
