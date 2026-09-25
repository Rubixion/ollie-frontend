"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Download, Loader2, Share2, X } from "lucide-react"

interface ShareableMatch {
  name: string
  similarity: number
  image?: string // data URL from the search response
  credit?: { author: string; license: string }
}

interface ShareOptions {
  me: boolean // the user's own photo next to the celebrity
  runnerUps: boolean // the next matches, as a small strip
  score: boolean // match percentages
}

// 9:16 for Instagram Stories and TikTok. Everything that matters sits between y=250 and y=1560,
// clear of the app UI those platforms draw over the top and bottom of a story.
const W = 1080, H = 1920
const BLUE = "rgb(100, 130, 210)" // --ollie-cyan

function loadImage(src: string) {
  const img = new Image()
  img.src = src
  return img.decode().then(() => img)
}

// Draws `img` into a square, cropped to fill it (like object-fit: cover)
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, size: number, radius = 28) {
  const s = Math.min(img.width, img.height)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, size, size, radius)
  ctx.clip()
  ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, x, y, size, size)
  ctx.restore()
}

// `text` cut with an ellipsis so it fits in `width` (fillText's maxWidth would squash the letters instead)
function fitText(ctx: CanvasRenderingContext2D, text: string, width: number) {
  if (ctx.measureText(text).width <= width) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > width) t = t.slice(0, -1)
  return `${t.trimEnd()}…`
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

async function drawCard(match: ShareableMatch, runnerUps: ShareableMatch[], userPhoto: string | null, opts: ShareOptions): Promise<Blob> {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "sans-serif"
  await Promise.all([document.fonts.load(`900 64px ${family}`), document.fonts.load(`700 32px ${family}`), document.fonts.load(`500 32px ${family}`)])

  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
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
  ctx.fillText("My celebrity lookalike is", 80, 390)

  // Photos: the celebrity's, and the user's only if they chose to show it. Both = side by side.
  const celeb = match.image ? await loadImage(match.image) : null
  const me = opts.me && userPhoto ? await loadImage(userPhoto) : null
  const rows = opts.runnerUps ? runnerUps.slice(0, 4) : []
  const compact = rows.length > 0 // photos and text shrink to make room for the runner-ups strip
  const top = 450
  let y = top
  if (celeb && me) {
    const size = compact ? 340 : 440
    const right = W - 80 - size
    drawCover(ctx, me, 80, top, size)
    drawCover(ctx, celeb, right, top, size)
    ctx.font = `500 32px ${family}`
    ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.fillText("Me", 80, top + size + 50)
    ctx.fillText(match.name, right, top + size + 50, size)
    y = top + size + 100
  } else if (celeb || me) {
    const size = compact ? 400 : 600
    drawCover(ctx, (celeb ?? me)!, (W - size) / 2, top, size)
    y = top + size + 40
  }

  ctx.fillStyle = "#fff"
  const nameSize = fitFont(ctx, match.name, 900, compact ? 96 : 120, W - 160, family)
  y += nameSize + 20
  ctx.fillText(match.name, 80, y)
  if (opts.score) {
    ctx.fillStyle = BLUE
    ctx.font = `900 ${compact ? 64 : 76}px ${family}`
    y += compact ? 90 : 110
    ctx.fillText(`${match.similarity.toFixed(1)}% match`, 80, y)
  }

  if (rows.length > 0) {
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.font = `500 30px ${family}`
    y += 64
    ctx.fillText("Also close", 80, y)
    const gap = 16
    const cw = (W - 160 - gap * 3) / 4
    const cardH = opts.score ? 192 : 158
    const cy = y + 22
    const thumbs = await Promise.all(rows.map((r) => (r.image ? loadImage(r.image).catch(() => null) : null)))
    ctx.textAlign = "center"
    rows.forEach((r, i) => {
      const cx = 80 + i * (cw + gap)
      ctx.fillStyle = "rgba(255,255,255,0.06)"
      ctx.beginPath()
      ctx.roundRect(cx, cy, cw, cardH, 24)
      ctx.fill()
      const t = 100
      const tx = cx + (cw - t) / 2
      const ty = cy + 12
      if (thumbs[i]) {
        drawCover(ctx, thumbs[i]!, tx, ty, t, 18)
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.08)"
        ctx.beginPath()
        ctx.roundRect(tx, ty, t, t, 18)
        ctx.fill()
      }
      ctx.fillStyle = "#fff"
      ctx.font = `700 24px ${family}`
      ctx.fillText(fitText(ctx, r.name, cw - 16), cx + cw / 2, ty + t + 34)
      if (opts.score) {
        ctx.fillStyle = BLUE
        ctx.font = `700 26px ${family}`
        ctx.fillText(`${r.similarity.toFixed(1)}%`, cx + cw / 2, ty + t + 68)
      }
    })
    ctx.textAlign = "left"
  }

  ctx.fillStyle = BLUE
  ctx.font = `700 44px ${family}`
  ctx.fillText("Find yours at ollie.ml", 80, 1470)
  ctx.font = `500 24px ${family}`
  ctx.fillStyle = "rgba(255,255,255,0.6)"
  // Licensed photos (the celebrity index) must carry their credit; photos without one print no credit line
  if (celeb && match.credit) ctx.fillText(`Photo of ${match.name}: ${match.credit.author}, ${match.credit.license} (cropped), via Wikimedia Commons`, 80, 1520, W - 160)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"))
}

interface Rendered {
  key: string // the options this image was drawn with
  blob: Blob
  url: string
  canShare: boolean
}

const OPTION_LABELS: { key: keyof ShareOptions; label: string; hint: string }[] = [
  { key: "me", label: "My photo", hint: "Next to your match" },
  { key: "runnerUps", label: "Runner-ups", hint: "The next four, in a small strip" },
  { key: "score", label: "Match percentages", hint: "On the top match and the runner-ups" },
]

// "Share my match" opens a dialog: a live preview of the image, what to show on it, then Share or Download.
export function ShareMatch({
  match,
  runnerUps,
  userPhoto,
  buttonClassName = "",
}: {
  match: ShareableMatch
  runnerUps: ShareableMatch[]
  userPhoto: string | null
  buttonClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [opts, setOpts] = useState<ShareOptions>({ me: true, runnerUps: true, score: true }) // side by side by default (owner's choice)
  const [result, setResult] = useState<Rendered | null>(null)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  const key = `${opts.me}-${opts.runnerUps}-${opts.score}`
  const hasMe = Boolean(userPhoto)
  const hasRunnerUps = runnerUps.length > 0
  // The image on screen was drawn with the current options; while it isn't, show the old one dimmed
  const stale = result?.key !== key

  // Draw the image whenever the dialog opens or an option changes
  useEffect(() => {
    if (!open) return
    let cancelled = false
    drawCard(match, runnerUps, userPhoto, opts)
      .then((blob) => {
        if (cancelled) return
        const file = new File([blob], "ollie-match.png", { type: "image/png" })
        setResult({ key, blob, url: URL.createObjectURL(blob), canShare: Boolean(navigator.canShare?.({ files: [file] })) })
        setError(null)
      })
      .catch(() => { if (!cancelled) setError("Couldn't make the image. Try again.") })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` stands for `opts`
  }, [open, key, match, runnerUps, userPhoto])

  // Free the previous preview when it's replaced, and the last one when the component goes away
  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url) }, [result?.url])

  const close = useCallback(() => {
    setOpen(false)
    setResult(null)
    requestAnimationFrame(() => openerRef.current?.focus())
  }, [])

  // Escape closes, the page behind doesn't scroll, and focus starts inside the dialog
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    window.addEventListener("keydown", onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = overflow
    }
  }, [open, close])

  const openDialog = (e: React.MouseEvent<HTMLButtonElement>) => {
    openerRef.current = e.currentTarget
    setError(null)
    setOpen(true)
  }
  const shareImage = async () => {
    if (!result) return
    try {
      const file = new File([result.blob], "ollie-match.png", { type: "image/png" })
      await navigator.share({ files: [file], text: `My celebrity lookalike is ${match.name}. Find yours at https://ollie.ml/match` })
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setError("Couldn't open sharing. Try Download instead.") // AbortError = share sheet closed
    }
  }

  const download = () => {
    if (!result) return
    const a = Object.assign(document.createElement("a"), { href: result.url, download: "ollie-match.png" })
    a.click()
  }

  const action = "flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan)"
  const ready = Boolean(result) && !stale

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={`min-h-11 rounded-xl border border-(--ollie-cyan)/50 px-5 text-sm font-bold text-(--ollie-cyan) transition-colors hover:bg-(--ollie-cyan)/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ollie-cyan) ${buttonClassName}`}
      >
        Share my match
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} aria-hidden="true" />
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="relative flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-[#0a0a0a] shadow-2xl shadow-black outline-none ring-1 ring-white/10"
            >
              <div className="flex items-center justify-between px-6 pb-2 pt-5">
                <h2 id={titleId} className="text-lg font-black tracking-tight text-white">Share your match</h2>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="grid size-9 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-(--ollie-cyan)"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="grid gap-6 overflow-y-auto px-6 pb-6 pt-2 md:grid-cols-[auto_1fr]">
                {/* Live preview: 9:16, the shape of a story */}
                <div className="mx-auto aspect-[9/16] h-[min(50svh,30rem)] shrink-0 overflow-hidden rounded-2xl bg-black md:h-[min(62svh,34rem)]">
                  {result ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={result.url}
                      alt="Preview of your share image"
                      className={`h-full w-full object-contain transition-opacity duration-200 ${stale ? "opacity-50" : ""}`}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-white/60">
                      <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" aria-hidden="true" />Making your image…</span>
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                  <fieldset>
                    <legend className="mb-2 text-sm font-semibold text-white/70">Show on the image</legend>
                    <div className="flex flex-col gap-1">
                      {OPTION_LABELS.map(({ key: k, label, hint }) => {
                        const disabled = (k === "me" && !hasMe) || (k === "runnerUps" && !hasRunnerUps)
                        return (
                          <label
                            key={k}
                            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-1.5 has-focus-visible:outline-2 has-focus-visible:outline-(--ollie-cyan) ${disabled ? "opacity-40" : "cursor-pointer hover:bg-white/5"}`}
                          >
                            <input
                              type="checkbox"
                              checked={opts[k] && !disabled}
                              disabled={disabled}
                              onChange={(e) => setOpts((o) => ({ ...o, [k]: e.target.checked }))}
                              className="size-4 shrink-0 accent-(--ollie-cyan)"
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-white">{label}</span>
                              <span className="block text-xs text-white/60">{hint}</span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>

                  {error && <p role="alert" className="text-sm text-red-300">{error}</p>}

                  <div className="mt-auto flex flex-col gap-2">
                    {result?.canShare && (
                      <button type="button" onClick={shareImage} disabled={!ready} className={`${action} bg-(--ollie-cyan) text-black hover:opacity-90`}>
                        <Share2 size={16} aria-hidden="true" />
                        Share
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={download}
                      disabled={!ready}
                      className={`${action} ${result?.canShare ? "bg-white/5 text-white hover:bg-white/10" : "bg-(--ollie-cyan) text-black hover:opacity-90"}`}
                    >
                      <Download size={16} aria-hidden="true" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
