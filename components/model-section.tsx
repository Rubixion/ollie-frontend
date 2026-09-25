import Link from "next/link"
import type { ComponentType, SVGProps } from "react"
import { ArrowRight } from "lucide-react"
import { INDEX, MODEL } from "@/lib/facts"
import { FileKeyIcon } from "@/components/ui/file-key-icon"
import { CpuIcon } from "@/components/ui/cpu-icon"
import { UsersIcon } from "@/components/ui/users-icon"
import { FilmSlateIcon, MicrophoneIcon, TrophyIcon } from "@/components/ui/category-icons"
import { TextEffect } from "@/components/ui/text-effect"
import { card } from "@/lib/surfaces"

export { card }
const ring = "relative flex aspect-square rounded-full border border-white/10 before:absolute before:-inset-2 before:rounded-full before:border before:border-white/5"

// Decorative: the look of an embedding, not real output
const NUMBERS = ["0.041", "-0.127", "0.338", "-0.062", "0.215", "0.009", "-0.284", "0.117", "0.052", "-0.193", "0.301", "-0.018"]

const CATEGORIES: [string, ComponentType<SVGProps<SVGSVGElement> & { size?: number }>][] = [
  ["Actors", FilmSlateIcon],
  ["Singers", MicrophoneIcon],
  ["Footballers", TrophyIcon],
]
// Animated icons fill their ring, so hovering anywhere on it plays them; CSS keeps the thin 1.5 stroke
const ringIcon = "grid size-full place-items-center text-(--ollie-cyan) [&_svg]:[stroke-width:1.5]"

// Bento layout after Tailark's features-8 block, filled with Ollie's facts
export function ModelSection() {
  return (
    <section className="px-6 pt-16 pb-24 md:pt-20 md:pb-32 max-w-6xl mx-auto flex flex-col items-center text-center" aria-labelledby="tech-heading">
      <h2 id="tech-heading" className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight text-balance">
        <TextEffect as="span" per="word" preset="blur" inView>Not a wrapper. A real neural network.</TextEffect>
      </h2>
      <p className="mt-3 text-white/70 text-base max-w-xl text-pretty">
        The network was written and trained from scratch 
      </p>
      <Link
        href="/match#how"
        className="group mt-4 inline-flex items-center gap-2 text-(--ollie-cyan) text-sm font-semibold underline-offset-4 hover:underline"
      >
        How Ollie works, in detail
        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform motion-reduce:transition-none" aria-hidden="true" />
      </Link>

      <div className="mt-12 grid w-full grid-cols-6 gap-3 text-left">
        {/* Benchmark */}
        <div data-reveal="1" className={`${card} col-span-full flex p-6 lg:col-span-2`}>
          <div className="m-auto text-center">
            <div className="relative mx-auto flex h-24 w-56 items-center">
              <svg className="absolute inset-0 size-full text-(--ollie-cyan)/20" viewBox="0 0 254 104" fill="none" aria-hidden="true">
                <path
                  d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                  fill="currentColor"
                />
              </svg>
              <span className="mx-auto block w-fit text-5xl font-semibold text-white tabular-nums">{MODEL.lfw}</span>
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-white">Accuracy on LFW</h3>
            <p className="mt-2 text-sm text-white/60 text-pretty">
              A benchmark that tests whether Ollie knows if two photos show the same person
            </p>
          </div>
        </div>

        {/* Privacy */}
        <div data-reveal="2" className={`${card} col-span-full p-6 sm:col-span-3 lg:col-span-2`}>
          <div className={`${ring} mx-auto mt-2 size-32`}>
            <FileKeyIcon size={48} className="m-auto text-(--ollie-cyan) [&_svg]:[stroke-width:1.25]" aria-hidden="true" />
          </div>
          <div className="mt-8 space-y-2 text-center">
            <h3 className="text-lg font-medium text-white">Private by default</h3>
            <p className="text-sm text-white/60 text-pretty">
              Your photo is held in memory for the search, then discarded. Never saved or used for training.
            </p>
          </div>
        </div>

        {/* Training (decorative curve) */}
        <div data-reveal="3" className={`${card} col-span-full p-6 sm:col-span-3 lg:col-span-2`}>
          <svg className="mt-4 w-full text-(--ollie-cyan)" viewBox="0 55 386 70" fill="none" aria-hidden="true">
            <path
              d="M3 123C3 123 14.3298 94.153 35.1282 88.0957C55.9266 82.0384 65.9333 80.5508 65.9333 80.5508C65.9333 80.5508 80.699 80.5508 92.1777 80.5508C103.656 80.5508 100.887 63.5348 109.06 63.5348C117.233 63.5348 117.217 91.9728 124.78 91.9728C132.343 91.9728 142.264 78.03 153.831 80.5508C165.398 83.0716 186.825 91.9728 193.761 91.9728C200.697 91.9728 206.296 63.5348 214.07 63.5348C221.844 63.5348 238.653 93.7771 244.234 91.9728C249.814 90.1684 258.8 60 266.19 60C272.075 60 284.1 88.057 286.678 88.0957C294.762 88.2171 300.192 72.9284 305.423 72.9284C312.323 72.9284 323.377 65.2437 335.553 63.5348C347.729 61.8259 348.218 82.07 363.639 80.5508C367.875 80.1335 372.949 82.2017 376.437 87.1008C379.446 91.3274 381.054 97.4325 382.521 104.647C383.479 109.364 382.521 123 382.521 123"
              fill="url(#ollie-train-fill)"
            />
            <path
              d="M3 121.077C3 121.077 15.3041 93.6691 36.0195 87.756C56.7349 81.8429 66.6632 80.9723 66.6632 80.9723C66.6632 80.9723 80.0327 80.9723 91.4656 80.9723C102.898 80.9723 100.415 64.2824 108.556 64.2824C116.696 64.2824 117.693 92.1332 125.226 92.1332C132.759 92.1332 142.07 78.5115 153.591 80.9723C165.113 83.433 186.092 92.1332 193 92.1332C199.908 92.1332 205.274 64.2824 213.017 64.2824C220.76 64.2824 237.832 93.8946 243.39 92.1332C248.948 90.3718 257.923 60.5 265.284 60.5C271.145 60.5 283.204 87.7182 285.772 87.756C293.823 87.8746 299.2 73.0802 304.411 73.0802C311.283 73.0802 321.425 65.9506 333.552 64.2824C345.68 62.6141 346.91 82.4553 362.27 80.9723C377.629 79.4892 383 106.605 383 106.605"
              stroke="currentColor"
              strokeWidth="3"
            />
            <defs>
              <linearGradient id="ollie-train-fill" x1="3" y1="60" x2="3" y2="123" gradientUnits="userSpaceOnUse">
                <stop stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="mt-10 space-y-2 text-center">
            <h3 className="text-lg font-medium text-white">Trained from scratch</h3>
            <p className="text-sm text-white/60 text-pretty">
              Trained on {MODEL.trainingSet}.
            </p>
          </div>
        </div>

        {/* The network */}
        <div data-reveal="1" className={`${card} col-span-full grid p-6 sm:grid-cols-2 lg:col-span-3`}>
          <div className="flex flex-col justify-between space-y-12 lg:space-y-6">
            <div className={`${ring} size-12`}>
              <CpuIcon size={20} className={ringIcon} aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">Ollie&apos;s own network</h3>
              <p className="text-sm text-white/60 text-pretty">
                {MODEL.summary[0].toUpperCase()}
                {MODEL.summary.slice(1)}.
              </p>
            </div>
          </div>
          {/* A window bleeding off the card's corner, showing what the network outputs */}
          <div className="relative -mr-6 -mb-6 mt-8 rounded-tl-2xl bg-black/35 p-6 pt-9 shadow-[inset_1px_1px_0_rgb(255_255_255/0.06)] sm:ml-6" aria-hidden="true">
            <div className="absolute left-4 top-3.5 flex gap-1.5">
              <span className="size-2 rounded-full bg-white/10" />
              <span className="size-2 rounded-full bg-white/10" />
              <span className="size-2 rounded-full bg-white/10" />
            </div>
            <p className="text-[11px] text-white/35">your face →</p>
            <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1.5 text-[11px] text-white/50 tabular-nums">
              {NUMBERS.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-(--ollie-cyan)/80">… 500 more</p>
          </div>
        </div>

        {/* The celebrities */}
        <div data-reveal="2" className={`${card} col-span-full grid p-6 sm:grid-cols-2 lg:col-span-3`}>
          <div className="flex flex-col justify-between space-y-12 lg:space-y-6">
            <div className={`${ring} size-12`}>
              <UsersIcon size={20} className={ringIcon} aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">{INDEX.celebrities} celebrities, all credited</h3>
              <p className="text-sm text-white/60 text-pretty">
                Well-known living adults, {INDEX.photos} photos in all ({INDEX.photosPerPerson} each), freely licensed from {INDEX.source} and
                credited next to every match.
              </p>
            </div>
          </div>
          {/* Categories strung along a line, alternating sides */}
          <div className="relative mt-6 before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-white/10 sm:-my-6 sm:-mr-6" aria-hidden="true">
            <div className="relative flex h-full flex-col justify-center gap-6 py-6">
              {CATEGORIES.map(([label, Icon], i) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 ${i % 2 ? "ml-[calc(50%-1rem)]" : "w-[calc(50%+1rem)] flex-row-reverse"}`}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-(--ollie-card) text-(--ollie-cyan) shadow-[0_0_0_4px_var(--ollie-bg)]">
                    <Icon size={14} />
                  </span>
                  <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs text-white/70">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
