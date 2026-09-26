// Initials avatar + name, used on blog cards and article headers.
export function AuthorBadge({ name, detail }: { name: string; detail?: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2)
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-(--ollie-cyan)/15 text-[10px] font-bold text-(--ollie-cyan)">
        {initials}
      </span>
      <span className="text-xs leading-tight">
        <span className="block font-semibold text-white/85">{name}</span>
        {detail && <span className="block text-white/55">{detail}</span>}
      </span>
    </span>
  )
}
