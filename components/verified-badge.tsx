import { BadgeCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  compact?: boolean
  iconOnly?: boolean
}

export function VerifiedBadge({ className, compact, iconOnly }: Props) {
  if (iconOnly) {
    return (
      <BadgeCheck
        className={cn(
          "shrink-0 text-sky-600 dark:text-sky-400",
          compact ? "h-4 w-4" : "h-4 w-4 sm:h-[18px] sm:w-[18px]",
          className,
        )}
        aria-label="Verified"
      />
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 rounded-full border font-medium",
        compact ? "h-5 gap-0.5 px-1.5 text-[10px] sm:text-[11px]" : "gap-1 px-2 text-xs",
        "border-sky-200 bg-sky-50 text-sky-700",
        "dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
        className,
      )}
    >
      <BadgeCheck className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
      Verified
    </Badge>
  )
}
