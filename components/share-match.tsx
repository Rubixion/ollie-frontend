"use client"

import { useId, useState } from "react"

interface ShareableMatch {
  name: string
  similarity: number
  image?: string // data URL from the search response
  credit?: { author: string; license: string }
}

const W = 1080, H = 1350 // 4:5, fits feeds, stories and chat previews
const BLUE = "rgb(100, 130, 210)" // --ollie-cyan

function loadImage(src: string) {
  const img = new Image()
  img.src = src
  return img.decode().then(() => img)
}

// Draws `img` into a square, cropped to fill it (like object-fit: cover)
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, size: number) {
  const s = Math.min(img.width, img.height)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, size, size, 28)
  ctx.clip()
  ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, x, y, size, size)
  ctx.restore()
}

// Largest font size (<= max) at which `text` fits in `width`
function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: number, max: number, width: number, family: string) {
  let size = max
  ctx.font = `${weight} ${size}px ${family}`
  while (ctx.measureText(text).width > width && size > 40) {
    size -= 4
    ctx.font = `${weight} ${size}px ${family}`
  }
  return size
}

async function drawCard(match: ShareableMatch, userPhoto: string | null): Promise<Blob> {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "sans-serif"
  await Promise.all([document.fonts.load(`900 64px ${family}`), document.fonts.load(`500 32px ${family}`)])

  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = "rgba(255,255,255,0.07)" // the site's dot grid
  for (let x = 16; x < W; x += 32) for (let y = 16; y < H; y += 32) ctx.fillRect(x, y, 2, 2)

  ctx.fillStyle = "#fff"
  ctx.font = `900 40px ${family}`
  ctx.letterSpacing = "6px"
  ctx.fillText("OLLIE", 80, 120)
  ctx.letterSpacing = "0px"

  // Photos: celebrity only when we can credit it (licensed index); the user's only if they opted in
  const celeb = match.image && match.credit ? await loadImage(match.image) : null
  const me = userPhoto ? await loadImage(userPhoto) : null
  const top = 200
  if (celeb && me) {
    drawCover(ctx, me, 80, top, 440)
    drawCover(ctx, celeb, 560, top, 440)
    ctx.font = `500 30px ${family}`
    ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.fillText("Me", 80, top + 490)
    ctx.fillText(match.name, 560, top + 490, 440)
  } else if (celeb || me) {
    drawCover(ctx, (celeb ?? me)!, 80, top, 560)
  }

  const textTop = celeb && me ? 820 : celeb || me ? 880 : 420
  ctx.fillStyle = "rgba(255,255,255,0.72)"
  ctx.font = `500 36px ${family}`
  ctx.fillText("My celebrity lookalike is", 80, textTop)
  ctx.fillStyle = "#fff"
  const nameSize = fitFont(ctx, match.name, 900, 104, W - 160, family)
  ctx.fillText(match.name, 80, textTop + nameSize + 16)
  ctx.fillStyle = BLUE
  ctx.font = `900 56px ${family}`
  ctx.fillText(`${match.similarity.toFixed(1)}% match`, 80, textTop + nameSize + 100)

  ctx.font = `500 24px ${family}`
  ctx.fillStyle = "rgba(255,255,255,0.6)"
  if (celeb) ctx.fillText(`Photo of ${match.name}: ${match.credit!.author}, ${match.credit!.license} (cropped), via Wikimedia Commons`, 80, H - 150, W - 160)
  ctx.fillText(`For fun. Not affiliated with ${match.name}.`, 80, H - 112, W - 160)
  ctx.fillStyle = BLUE
  ctx.font = `700 32px ${family}`
  ctx.fillText("Find yours at ollie.ml", 80, H - 60)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"))
}

export function ShareMatch({ match, userPhoto }: { match: ShareableMatch; userPhoto: string | null }) {
  const [includeMe, setIncludeMe] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const checkboxId = useId()

  const share = async () => {
    setBusy(true)
    setError(null)
    try {
      const blob = await drawCard(match, includeMe ? userPhoto : null)
      const file = new File([blob], "ollie-match.png", { type: "image/png" })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `My celebrity lookalike is ${match.name}. Find yours at https://ollie.ml/match` })
      } else {
        const url = URL.createObjectURL(blob)
        const a = Object.assign(document.createElement("a"), { href: url, download: file.name })
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setError("Couldn't make the image. Try again.") // AbortError = share sheet closed
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <label htmlFor={checkboxId} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-white/75">
        <input
          id={checkboxId}
          type="checkbox"
          checked={includeMe}
          onChange={(e) => setIncludeMe(e.target.checked)}
          disabled={!userPhoto}
          className="size-4 accent-(--ollie-cyan)"
        />
        Include my photo
      </label>
      <button
        type="button"
        onClick={share}
        disabled={busy}
        className="min-h-11 rounded-xl border border-(--ollie-cyan)/50 px-5 text-sm font-bold text-(--ollie-cyan) transition-colors hover:bg-(--ollie-cyan)/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"
      >
        {busy ? "Making image…" : "Share my match"}
      </button>
      {error && <p role="alert" className="text-sm text-red-300 sm:basis-full">{error}</p>}
    </div>
  )
}
