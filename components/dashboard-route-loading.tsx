export function DashboardRouteLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f4f5] dark:bg-neutral-950">
      <div className="border-b border-black/10 bg-white px-3 py-3 dark:border-white/10 dark:bg-neutral-950">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
      <div className="space-y-3 px-3 py-3">
        <div className="h-6 w-28 animate-pulse rounded-md bg-neutral-200/80 dark:bg-neutral-800" />
        <div className="h-24 animate-pulse rounded-2xl bg-white dark:bg-neutral-900" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 animate-pulse rounded-2xl bg-white dark:bg-neutral-900" />
          <div className="h-16 animate-pulse rounded-2xl bg-white dark:bg-neutral-900" />
          <div className="h-16 animate-pulse rounded-2xl bg-white dark:bg-neutral-900" />
        </div>
        <div className="h-56 animate-pulse rounded-2xl bg-white dark:bg-neutral-900" />
      </div>
    </div>
  )
}
