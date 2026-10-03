"use client"

// "Share" under the /ai-stylist model: a link that opens this exact outfit (the look is in the URL, see encodeLook),
// and a 9:16 story card of it drawn in the browser (same look as the match card). Nothing is uploaded or stored.
// ponytail: the link's unfurl preview is the static /ai-stylist card; a per-outfit OG image would be drawn in the
// Worker, over the free plan's 10 ms CPU cap. Add one (app/ai-stylist/look/[code]/opengraph-image) on Workers Paid.
import { useEffect, useState } from "react"
import { Download, Loader2, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SocialButton from "@/components/ui/social-button"
import { fitFont, fitText, loadImage } from "@/components/share-match"
import { ITEMS, type Slot } from "@/lib/style/catalog"
import { body, colorOf, handsLayer, layers, modelPhoto, outfitTotal, type Assets } from "@/lib/style/model"
import { recolored } from "@/lib/style/recolor"
import { encodeLook, type SavedLook } from "@/lib/style/saved"
import { SITE_URL } from "@/lib/site-config"
import { track } from "@/lib/analytics"

const W = 1080, H = 1920
const BLUE = "rgb(100, 130, 210)" // --ollie-cyan
const SLOT_LABEL: Record<Slot, string> = { top: "Top", outer: "Jacket", bottom: "Bottoms", shoes: "Shoes" }

// `text` in at most two lines of `width`, the second cut with an ellipsis
function twoLines(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const words = text.split(" ")
  let first = ""
  while (words.length && ctx.measureText(`${first} ${words[0]}`.trim()).width <= width) first = `${first} ${words.shift()}`.trim()
  return words.length ? [first, fitText(ctx, words.join(" "), width)] : [first]
}

// one clothes layer as the editor shows it: recoloured when tinted, cut to the jacket's clip mask when it has one
async function layerImage(src: string, tint?: string, mask?: string): Promise<CanvasImageSource> {
  const img = await loadImage(tint ? await recolored(src, tint) : src)
  if (!mask) return img
  const c = Object.assign(document.createElement("canvas"), { width: img.width, height: img.height })
  const ctx = c.getContext("2d")!
  ctx.drawImage(img, 0, 0)
  ctx.globalCompositeOperation = "destination-in" // keep only where the mask is opaque, like CSS mask-image
  ctx.drawImage(await loadImage(mask), 0, 0, c.width, c.height)
  return c
}

async function drawCard(look: SavedLook, name: string, assets: Assets): Promise<Blob> {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "sans-serif"
  await Promise.all([document.fonts.load(`900 64px ${family}`), document.fonts.load(`700 32px ${family}`), document.fonts.load(`500 32px ${family}`)]).catch(() => {})
  const u = (src: string) => (assets.v ? `${src}?v=${assets.v}` : src)

  const canvas = Object.assign(document.createElement("canvas"), { width: W, height: H })
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = "rgba(255,255,255,0.07)" // the site's dot grid
  for (let x = 16; x < W; x += 32) for (let y = 16; y < H; y += 32) ctx.fillRect(x, y, 2, 2)

  ctx.fillStyle = "#fff"
  ctx.font = `900 44px ${family}`
  ctx.letterSpacing = "6px"
  ctx.fillText("OLLIE", 80, 300)
  ctx.letterSpacing = "0px"
  ctx.fillStyle = "rgba(255,255,255,0.72)"
  ctx.font = `500 40px ${family}`
  ctx.fillText("My outfit, styled on Ollie", 80, 370)

  // the model, 3:4 like the layer images, on the editor's backdrop
  const mx = 80, my = 420, mw = 540, mh = 720
  ctx.save()
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(mx, my, mw, mh, 28)
  else ctx.rect(mx, my, mw, mh)
  ctx.clip()
  const bg = ctx.createLinearGradient(0, my, 0, my + mh)
  bg.addColorStop(0, "#aea296")
  bg.addColorStop(1, "#bbafa5")
  ctx.fillStyle = bg
  ctx.fillRect(mx, my, mw, mh)
  const stack = layers(look.gender, look.build, look.outfit, assets.layers[body(look.gender, look.build)] ?? [], look.tints).concat(handsLayer(look.gender, look.build, look.lookId))
  const imgs = await Promise.all([
    loadImage(u(modelPhoto(look.gender, look.build, look.lookId))),
    ...stack.map((l) => layerImage(u(l.src), l.tint, l.mask && u(l.mask)).catch(() => null)), // a missing layer shouldn't sink the card
  ])
  for (const img of imgs) if (img) ctx.drawImage(img, mx, my, mw, mh)
  ctx.restore()

  // the pieces, beside the model
  const tx = 660, tw = W - 80 - tx
  let y = my + 30
  for (const slot of ["top", "outer", "bottom", "shoes"] as Slot[]) {
    const it = look.outfit[slot] ? ITEMS.find((i) => i.id === look.outfit[slot]) : undefined
    if (!it) continue
    ctx.fillStyle = BLUE
    ctx.font = `700 26px ${family}`
    ctx.fillText(SLOT_LABEL[slot].toUpperCase(), tx, y)
    ctx.fillStyle = "#fff"
    ctx.font = `700 34px ${family}`
    for (const line of twoLines(ctx, it.name, tw)) ctx.fillText(line, tx, (y += 44))
    const detail = [colorOf(it.id, look.tints?.[slot])?.name, it.price].filter(Boolean).join(" · ")
    if (detail) {
      ctx.fillStyle = "rgba(255,255,255,0.6)"
      ctx.font = `500 26px ${family}`
      ctx.fillText(fitText(ctx, detail, tw), tx, (y += 38))
    }
    y += 64
  }

  ctx.fillStyle = "#fff"
  y = my + mh + 40 + fitFont(ctx, name, 900, 96, W - 160, family)
  ctx.fillText(name, 80, y)
  const total = Math.round(outfitTotal(look.outfit))
  if (total > 0) {
    ctx.fillStyle = BLUE
    ctx.font = `900 60px ${family}`
    ctx.fillText(`The whole look: about $${total}`, 80, y + 90, W - 160)
  }

  ctx.fillStyle = BLUE
  const cta = "Dress yours free at ollieml.com/ai-stylist"
  ctx.font = `700 44px ${family}`
  ctx.font = `700 ${Math.min(44, Math.floor((44 * (W - 160)) / ctx.measureText(cta).width))}px ${family}`
  ctx.fillText(cta, 80, 1490)
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"))
}

export function ShareOutfit({ look, name, assets }: { look: SavedLook; name: string; assets: Assets }) {
  const [open, setOpen] = useState(false)
  const [card, setCard] = useState<{ file: File; url: string; canShare: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const link = `${SITE_URL}/ai-stylist?look=${encodeLook(look, name)}`
  const lookKey = JSON.stringify(look) + name

  // drawn when the dialog opens (the look can't change while it's open)
  useEffect(() => {
    if (!open) return
    let cancelled = false
    drawCard(look, name, assets)
      .then((blob) => {
        if (cancelled) return
        const file = new File([blob], "ollie-outfit.png", { type: "image/png" })
        setCard({ file, url: URL.createObjectURL(blob), canShare: Boolean(navigator.canShare?.({ files: [file] })) })
      })
      .catch((e) => !cancelled && setError(`Couldn't make the image. Try again. (${e instanceof Error ? e.message : e})`))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `lookKey` stands for `look` and `name`
  }, [open, lookKey, assets])
  useEffect(() => () => { if (card) URL.revokeObjectURL(card.url) }, [card])

  async function shareImage() {
    if (!card) return
    try {
      await navigator.share({ files: [card.file], text: `My outfit on Ollie Stylist. Open it and shop the pieces: ${link}` })
      track("share", { content_type: "outfit", method: "image" })
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setError("Couldn't open sharing. Try Download instead.") // AbortError = sheet closed
    }
  }
  function download() {
    if (!card) return
    Object.assign(document.createElement("a"), { href: card.url, download: card.file.name }).click()
    track("share", { content_type: "outfit", method: "download" })
  }

  return (
    <>
      <Button variant="brandOutline" size="cta" aria-label="Share this outfit" className="gap-2"
        onClick={() => { setError(null); setOpen(true); track("style_outfit_share_open") }}>
        <Share2 size={16} aria-hidden="true" /><span className="max-sm:sr-only">Share</span>
      </Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setCard(null) }}>
        <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Share your outfit</DialogTitle>
            <DialogDescription>Send the link so friends can open this exact look and shop it, or post the picture.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="mx-auto aspect-[9/16] h-[min(48svh,30rem)] shrink-0 overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 md:h-[min(60svh,32rem)]">
              {card ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob URL
                <img src={card.url} alt={`Share image of ${name}`} className="size-full object-contain" />
              ) : (
                <div className="grid size-full place-items-center text-sm text-white/60">
                  <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" aria-hidden="true" />Making your image…</span>
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-white">Link</p>
                <p className="truncate rounded-xl bg-black/35 px-3 py-2.5 font-mono text-xs text-white/60" title={link}>{link}</p>
                <SocialButton url={link} title={`${name} · my outfit on Ollie Stylist`} kind="outfit" />
              </div>
              <div className="mt-auto flex flex-col gap-2">
                <p className="text-sm font-semibold text-white">Picture</p>
                {card?.canShare && (
                  <Button variant="brand" size="cta" onClick={shareImage} className="gap-2"><Share2 size={16} aria-hidden="true" />Share image</Button>
                )}
                <Button variant={card?.canShare ? "brandOutline" : "brand"} size="cta" onClick={download} disabled={!card} className="gap-2">
                  <Download size={16} aria-hidden="true" />Download image
                </Button>
                {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
