import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"

interface KPICardProps {
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon?: LucideIcon
}

export function KPICard({ title, value, change, trend, icon: Icon }: KPICardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs sm:text-sm">{title}</CardDescription>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-xl sm:text-2xl font-bold tracking-tight">{value}</div>
        {change && (
          <div className="flex items-center gap-1">
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            ) : trend === "down" ? (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            ) : null}
            <span
              className={`text-xs sm:text-sm font-medium ${
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
