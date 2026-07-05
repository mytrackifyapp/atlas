import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function DashboardSidebarShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl",
        "border border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
        "dark:border-[#2a2a2a] dark:bg-[#141414] dark:shadow-none",
        className,
      )}
    >
      {children}
    </div>
  )
}
