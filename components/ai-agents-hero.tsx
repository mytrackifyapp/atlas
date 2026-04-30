"use client"

import { Brain } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"

function colorFor(i: number) {
  const colors = [
    "bg-amber-400",
    "bg-emerald-400",
    "bg-sky-400",
    "bg-fuchsia-400",
    "bg-lime-400",
    "bg-rose-400",
    "bg-violet-400",
    "bg-cyan-400",
  ]
  return colors[i % colors.length]
}

export function AiAgentsHero({
  onBegin,
  ctaHref,
  ctaLabel = "Begin",
}: {
  onBegin?: () => void
  ctaHref?: string
  ctaLabel?: string
}) {
  const items = AI_AGENTS_CATALOG.slice(0, 10)

  return (
    <section className="overflow-hidden border-y bg-background">
      {/* AI Team strip (like screenshot) */}
      <div className="relative bg-background">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-background to-transparent" />

        <div className="py-4">
          <div className="overflow-x-auto">
            <div className="flex gap-4 px-4 sm:px-6 lg:px-8 min-w-max">
              {items.map((a, idx) => {
                const bg = colorFor(idx)
                const title = a.name.toUpperCase()
                return (
                  <div
                    key={a.id}
                    className={cn(
                      "relative h-[145px] w-[168px] sm:h-[169px] sm:w-[182px] rounded-xl overflow-hidden border",
                      bg,
                    )}
                  >
                    {a.imageSrc ? (
                      <Image
                        src={a.imageSrc}
                        alt={a.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 168px, 182px"
                        priority={a.id === "ai-cfo"}
                      />
                    ) : null}

                    {/* big watermark text */}
                    <div className={cn("absolute inset-0 opacity-30 text-black", a.imageSrc ? "hidden" : "")}>
                      <div className="absolute -top-3 left-3 text-5xl font-black tracking-tight">
                        {title.slice(0, 6)}
                      </div>
                      <div className="absolute top-10 left-3 text-5xl font-black tracking-tight">
                        {title.slice(6, 12)}
                      </div>
                    </div>

                    {/* label pill */}
                    <div className="absolute bottom-3 left-3">
                      <div className="inline-flex items-center rounded-md bg-white/85 px-2.5 py-1 text-[11px] font-medium text-black shadow-sm">
                        {a.name}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Centered hero copy */}
      <div className="relative px-6 sm:px-10 py-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.12),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
            <Brain className="h-3.5 w-3.5" />
            AI employees for your startup
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
            YOUR AI TEAM
            <br />
            TO SCALE YOUR BUSINESS
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            Get an AI team to help with legal, finance, sales, marketing, and operations.
          </p>

          <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
            {ctaHref ? (
              <Button className="px-8" asChild>
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            ) : (
              <Button className="px-8" onClick={onBegin}>
                {ctaLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

