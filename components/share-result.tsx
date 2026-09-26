"use client"

// Share button for the hidden /kirk-meter and /compare pages: draws a 9:16 story card (same look as the
// match page's), then opens the share sheet, or downloads it where sharing files isn't supported.
import { useState } from "react"
import { Loader2, Share2 } from "lucide-react"
import { drawCover, fitFont, loadImage } from "@/components/share-match"

const W = 1080, H = 1920
const BLUE = "rgb(100, 130, 210)" // --ollie-cyan

export interface ShareCard {
  intro: string // small line above the photos
  photos: [{ src: string; label: string }, { src: string; label: string }]
  headline: string // the big line, e.g. "87.3% Kirk"
  subline?: string // blue line under it
  path: string // e.g. "kirk-meter": printed as ollieml.com/<path> and linked in the share text
  text: string // share sheet text, before the link
}

async function drawCard(card: ShareCard): Promise<Blob> {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "sans-serif"
  await Promise.all([document.fonts.load(`900 64px ${family}`), document.fonts.load(`500 32px ${family}`)]).catch(() => {})

  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = "rgba(255,255,255,0.07)"
  for (let x = 16; x < W; x += 32) for (let y = 16; y < H; y += 32) ctx.fillRect(x, y, 2, 2)

  ctx.fillStyle = "#fff"
  ctx.font = `900 44px ${family}`
  ctx.letterSpacing = "6px"
  ctx.fillText("OLLIE", 80, 300)
  ctx.letterSpacing = "0px"
  ctx.fillStyle = "rgba(255,255,255,0.72)"
  ctx.font = `500 40px ${family}`
  ctx.fillText(card.intro, 80, 390, W - 160)

  const size = 440, top = 450
  const imgs = await Promise.all(card.photos.map((p) => loadImage(p.src)))
  ctx.font = `500 32px ${family}`
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  imgs.forEach((img, i) => {
    const x = i === 0 ? 80 : W - 80 - size
    drawCover(ctx, img, x, top, size)
    ctx.fillText(card.photos[i].label, x, top + size + 50, size)
  })

  let y = top + size + 100
  ctx.fillStyle = "#fff"
  y += fitFont(ctx, card.headline, 900, 120, W - 160, family) + 20
  ctx.fillText(card.headline, 80, y)
  if (card.subline) {
    ctx.fillStyle = BLUE
    ctx.font = `900 76px ${family}`
    y += 110
    ctx.fillText(card.subline, 80, y, W - 160)
  }

  ctx.fillStyle = BLUE
  ctx.font = `700 44px ${family}`
  ctx.fillText(`Try it at ollieml.com/${card.path}`, 80, 1470, W - 160)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"))
}

export function ShareResult({ card, className = "" }: { card: ShareCard; className?: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const share = async () => {
    setBusy(true)
    setError(null)
    try {
      const file = new File([await drawCard(card)], `ollie-${card.path}.png`, { type: "image/png" })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${card.text} https://www.ollieml.com/${card.path}` })
      } else {
        const url = URL.createObjectURL(file)
        Object.assign(document.createElement("a"), { href: url, download: file.name }).click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setError("Couldn't share the image. Try again.") // AbortError = share sheet closed
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={share}
        disabled={busy}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-(--ollie-cyan)/50 px-5 text-sm font-bold text-(--ollie-cyan) transition-colors hover:bg-(--ollie-cyan)/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"
      >
        {busy ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Share2 size={14} aria-hidden="true" />}
        Share
      </button>
      {error && <p role="alert" className="mt-2 text-center text-sm text-red-300">{error}</p>}
    </div>
  )
}
