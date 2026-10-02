// 21st.dev "Icon Link Card" (cnippet-dev/v-card-14), adapted to Ollie: dark card, cyan icon badge, props instead of
// hard-coded text, and the icon beside the text so it fits narrow panels.
import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function IconLinkCard({ icon, title, description, link, href, onClick, className }: {
  icon: ReactNode; title: string; description: string; link: string; href: string; onClick?: () => void; className?: string
}) {
  return (
    <Card className={cn("border-white/10 bg-black/35 text-white shadow-none", className)}>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-(--ollie-cyan)/15 [&_svg]:size-5 [&_svg]:text-(--ollie-cyan)">
          {icon}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Link href={href} onClick={onClick} className="block text-sm font-semibold leading-tight text-white hover:text-(--ollie-cyan)">{title}</Link>
          <p className="text-xs leading-relaxed text-white/60">{description}</p>
          <Link href={href} onClick={onClick} tabIndex={-1}
            className="inline-flex items-center gap-1 text-xs font-semibold text-(--ollie-cyan) hover:underline">
            {link}
            <ChevronRightIcon aria-hidden="true" className="size-3 shrink-0" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
