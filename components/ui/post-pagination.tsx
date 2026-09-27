// Pagination with Arrows from 21st.dev (sean0205/pagination-arrows): https://21st.dev/sean0205/pagination-arrows
// Ollie: previous/next blog posts come in as props and show their titles; Ollie's colors.
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"

type Neighbor = { href: string; title: string } | null

export default function PostPagination({ prev, next }: { prev: Neighbor; next: Neighbor }) {
  const link = "h-auto max-w-full flex-col items-start gap-1 whitespace-normal rounded-2xl px-4 py-3 text-left text-white/80 hover:bg-white/[0.05] hover:text-white"
  return (
    <Pagination className="w-full" aria-label="More articles">
      <PaginationContent className="w-full justify-between gap-4">
        <PaginationItem className="min-w-0 flex-1">
          {prev && (
            <PaginationLink href={prev.href} size="default" className={link} rel="prev">
              <span className="flex items-center gap-2 text-xs font-semibold text-(--ollie-cyan)">
                <ArrowLeftIcon className="size-4" /> Previous
              </span>
              <span className="line-clamp-2 text-sm font-semibold">{prev.title}</span>
            </PaginationLink>
          )}
        </PaginationItem>
        <PaginationItem className="min-w-0 flex-1">
          {next && (
            <PaginationLink href={next.href} size="default" className={`${link} ml-auto items-end text-right`} rel="next">
              <span className="flex items-center gap-2 text-xs font-semibold text-(--ollie-cyan)">
                Next <ArrowRightIcon className="size-4" />
              </span>
              <span className="line-clamp-2 text-sm font-semibold">{next.title}</span>
            </PaginationLink>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
