import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon?: LucideIcon
}

export type KPIStripItem = {
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon?: LucideIcon
  active?: boolean
  onClick?: () => void
}

export function KPIStrip({
  items,
  compact = false,
  fullWidth = false,
  className,
}: {
  items: KPIStripItem[]
  compact?: boolean
  fullWidth?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#171717] sm:w-fit sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-center sm:px-2 sm:py-3.5",
        fullWidth && "sm:w-full lg:flex-nowrap",
        className,
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon
        const content = (
          <>
            <p className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 sm:whitespace-nowrap">
              {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} /> : null}
              <span className="truncate">{item.title}</span>
            </p>
            <div className="flex shrink-0 items-baseline gap-1.5 sm:mt-1">
              <span className="text-base font-semibold tracking-tight text-neutral-950 dark:text-white">
                {item.value}
              </span>
              {item.change ? (
                <span
                  className={cn(
                    "text-xs font-medium",
                    item.trend === "up"
                      ? "text-emerald-600"
                      : item.trend === "down"
                        ? "text-red-500"
                        : "text-neutral-400",
                  )}
                >
                  {item.change}
                </span>
              ) : null}
            </div>
          </>
        )
        const itemClass = cn(
          "flex flex-row items-center justify-between gap-3 px-4 py-3.5 text-left sm:flex-col sm:items-start sm:justify-center sm:py-0.5",
          fullWidth
            ? "sm:min-w-[6.25rem] sm:flex-1 sm:px-3"
            : cn("sm:w-max sm:max-w-full sm:shrink-0", compact ? "sm:px-4" : "sm:px-6"),
          index > 0 && "border-t border-black/10 dark:border-white/10 sm:border-t-0 sm:border-l",
          item.active && "bg-neutral-50 dark:bg-white/[0.04] sm:rounded-lg",
          item.onClick &&
            "cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.04] sm:rounded-lg",
        )

        if (item.onClick) {
          return (
            <button
              key={item.title}
              type="button"
              className={itemClass}
              onClick={item.onClick}
              aria-pressed={item.active}
            >
              {content}
            </button>
          )
        }

        return (
          <div key={item.title} className={itemClass}>
            {content}
          </div>
        )
      })}
    </div>
  )
}

export function KPICard({ title, value, change, trend, icon: Icon }: KPICardProps) {
  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardHeader className="p-3 pb-1.5 sm:p-3.5 sm:pb-1.5">
        <div className="flex items-center justify-between gap-2">
          <CardDescription className="text-[11px] leading-tight sm:text-xs">{title}</CardDescription>
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-0.5 p-3 pt-0 sm:p-3.5 sm:pt-0">
        <div className="text-base font-semibold tracking-tight sm:text-lg">{value}</div>
        {change && (
          <div className="flex items-center gap-0.5">
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3 text-emerald-600" />
            ) : trend === "down" ? (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            ) : null}
            <span
              className={`text-[11px] font-medium ${
                trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
              }`}
            >
              {change}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
