"use client"
// 21st.dev "Pricing Section with Frequency Toggle" (efferd/pricing-4), adapted to Ollie: Monthly / Yearly /
// Lifetime as three cards (so no frequency toggle or NumberFlow), Ollie's dark glass and one blue accent.
import { AnimatePresence, motion } from "motion/react"
import { CheckCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PricingPlan = {
  name: string
  info: string
  price: string
  period: string
  features: string[]
  btn: { text: string; onClick: () => void; disabled?: boolean }
  highlighted?: boolean
  badge?: string
}

export function PricingSection({ title, subtitle, plans }: { title: string; subtitle: string; plans: PricingPlan[] }) {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-7 p-4">
      <div className="mx-auto max-w-xl space-y-2">
        <h2 className="text-center text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl lg:font-extrabold">{title}</h2>
        <p className="text-center text-sm text-white/60 md:text-base">{subtitle}</p>
      </div>
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => <PricingCard key={plan.name} plan={plan} />)}
      </div>
    </div>
  )
}

export function PricingCard({ plan, className, ...props }: React.ComponentProps<"div"> & { plan: PricingPlan }) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xs",
        plan.highlighted && "border-(--ollie-cyan)/50 md:scale-105",
        className,
      )}
      {...props}
    >
      <div className={cn("border-b border-white/10 p-4", plan.highlighted && "bg-white/[0.04]")}>
        <AnimatePresence mode="wait">
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
            {plan.highlighted && (
              <motion.div className="flex items-center gap-1 rounded-md border border-white/15 bg-black/60 px-2 py-0.5 text-xs text-white" key="popular-badge" layout transition={{ duration: 0.1 }}>
                <Star className="size-3 fill-current" aria-hidden="true" />
                Popular
              </motion.div>
            )}
            {plan.badge && (
              <motion.div animate={{ opacity: 1 }} className="rounded-md bg-(--ollie-cyan) px-2 py-0.5 text-xs font-semibold text-black" exit={{ opacity: 0 }} initial={{ opacity: 0 }} key="discount-badge" layout transition={{ duration: 0.15 }}>
                {plan.badge}
              </motion.div>
            )}
          </div>
        </AnimatePresence>
        <div className="text-lg font-medium text-white">{plan.name}</div>
        <p className="text-sm font-normal text-white/60">{plan.info}</p>
        <h3 className="mt-6 mb-1 flex w-max items-end gap-1">
          <span className="text-3xl font-extrabold text-white">{plan.price}</span>
          <span className="pb-1 text-base font-normal text-white/60">{plan.period}</span>
        </h3>
      </div>
      <div className={cn("space-y-3 px-4 pt-6 pb-8 text-sm text-white/70", plan.highlighted && "bg-white/[0.02]")}>
        {plan.features.map((feature) => (
          <div className="flex items-center gap-2" key={feature}>
            <CheckCircle className="size-3.5 shrink-0 text-(--ollie-cyan)" aria-hidden="true" />
            <p>{feature}</p>
          </div>
        ))}
      </div>
      <div className={cn("mt-auto w-full border-t border-white/10 p-3", plan.highlighted && "bg-white/[0.04]")}>
        <Button className="w-full" variant={plan.highlighted ? "brand" : "brandOutline"} onClick={plan.btn.onClick} disabled={plan.btn.disabled}>
          {plan.btn.text}
        </Button>
      </div>
    </div>
  )
}
