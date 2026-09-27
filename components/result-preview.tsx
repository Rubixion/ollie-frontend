import { Skeleton } from "@/components/ui/skeleton"

// Faded outlines of the results, shown in the empty results panel before a search so people can see what they'll
// get. Built from the 21st.dev Skeleton, with its pulse off: nothing is loading yet.
const sk = "animate-none bg-white/[0.06]"

export function PreviewCaption({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="text-center">
      <p className="text-white/70 font-medium">{title}</p>
      {sub && <p className="mt-1 text-sm text-white/50">{sub}</p>}
    </div>
  )
}

// Mirrors the match results, compacted to fit the panel without growing it: closest match (you + them, name,
// score), then runners-up 2 to 5
export function MatchPreview() {
  return (
    <div className="flex flex-col gap-4 opacity-70" aria-hidden="true">
      <div>
        <p className="text-sm font-semibold text-white/50">Your closest match</p>
        <div className="mt-2 flex items-center gap-3">
          <Skeleton className={`${sk} size-20 shrink-0 rounded-xl`} />
          <Skeleton className={`${sk} size-20 shrink-0 rounded-xl border border-(--ollie-cyan)/25`} />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className={`${sk} h-4 w-3/4`} />
            <Skeleton className={`${sk} h-3 w-1/2`} />
          </div>
          <span className="shrink-0 text-2xl font-black text-(--ollie-cyan)/50 tabular-nums">–%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-white/50">Runners-up</p>
        <ol className="mt-2 flex flex-col gap-1.5">
          {[2, 3, 4, 5].map((n) => (
            // Short screens show two runners-up, so the preview never makes the panel taller than the screen
            <li key={n} className={`flex items-center gap-3 rounded-xl bg-white/[0.03] p-2 ${n > 3 ? "[@media(max-height:860px)]:hidden" : ""}`}>
              <span className="w-4 shrink-0 text-center text-xs font-bold text-white/40 tabular-nums">{n}</span>
              <Skeleton className={`${sk} size-9 shrink-0 rounded-lg`} />
              <Skeleton className={`${sk} h-3 flex-1 max-w-48`} />
              <Skeleton className={`${sk} ml-auto h-3 w-10`} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

// Mirrors the Compare / Kirk results: two photos side by side, a score, and its bar
export function PairPreview({ labels }: { labels: [string, string] }) {
  return (
    <div className="flex flex-col gap-4 opacity-70" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3">
        {labels.map((label) => (
          <div key={label}>
            <Skeleton className={`${sk} aspect-square w-full rounded-xl`} />
            <p className="mt-1.5 text-xs text-white/40">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-5xl font-black text-(--ollie-cyan)/50 tabular-nums">–%</p>
      <Skeleton className={`${sk} h-2 w-full rounded-full`} />
    </div>
  )
}
