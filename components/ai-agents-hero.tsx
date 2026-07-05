"use client"

import { useEffect, useRef } from "react"
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
  variant = "marketing",
  onBegin,
  ctaHref,
  ctaLabel = "Get Started",
}: {
  variant?: "marketing" | "embedded"
  onBegin?: () => void
  ctaHref?: string
  ctaLabel?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.play().catch(() => {})
  }, [])

  const ctaButton = ctaHref ? (
    <Button
      size="lg"
      className={cn(
        "rounded-full px-8 text-base font-semibold shadow-lg",
        variant === "marketing"
          ? "bg-[#4483f2] text-white hover:bg-[#3a75e0] h-12"
          : "",
      )}
      asChild
    >
      <Link href={ctaHref}>{ctaLabel}</Link>
    </Button>
  ) : (
    <Button
      size="lg"
      className={cn(
        "rounded-full px-8 text-base font-semibold shadow-lg",
        variant === "marketing"
          ? "bg-[#4483f2] text-white hover:bg-[#3a75e0] h-12"
          : "",
      )}
      onClick={onBegin}
    >
      {ctaLabel}
    </Button>
  )

  if (variant === "marketing") {
    return (
      <section className="relative min-h-[100svh] overflow-hidden bg-neutral-950">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          poster="/cfo.png"
        >
          <source src="/trackifyai.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />

        <div className="relative flex min-h-[100svh] items-end lg:items-center">
          <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-28 lg:px-8 lg:pb-24 lg:pt-32">
            <div className="max-w-xl lg:max-w-2xl">
              <h1 className="text-[2.25rem] font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                AI Employees: Your First Digital Workers Team That Never Sleep
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
                Hire AI employees today — get your first 24/7 digital team that runs your socials,
                inbox, website, content, customer support, and business operations without adding
                extra headcount.
              </p>
              <div className="mt-8">{ctaButton}</div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const items = AI_AGENTS_CATALOG.slice(0, 10)

  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 bg-background">
      <div className="relative bg-background">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent sm:w-16" />

        <div className="py-4">
          <div className="overflow-x-auto">
            <div className="flex min-w-max gap-4 px-4 sm:px-6">
              {items.map((a, idx) => {
                const bg = colorFor(idx)
                const title = a.name.toUpperCase()
                return (
                  <div
                    key={a.id}
                    className={cn(
                      "relative h-[145px] w-[168px] overflow-hidden rounded-xl border sm:h-[169px] sm:w-[182px]",
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

                    <div className={cn("absolute inset-0 text-black opacity-30", a.imageSrc ? "hidden" : "")}>
                      <div className="absolute -top-3 left-3 text-5xl font-black tracking-tight">
                        {title.slice(0, 6)}
                      </div>
                      <div className="absolute top-10 left-3 text-5xl font-black tracking-tight">
                        {title.slice(6, 12)}
                      </div>
                    </div>

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

      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.12),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight leading-[1.05] sm:text-4xl">
            Your AI team to scale your business
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Get an AI team to help with legal, finance, sales, marketing, and operations.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">{ctaButton}</div>
        </div>
      </div>
    </section>
  )
}
