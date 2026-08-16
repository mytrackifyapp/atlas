"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Wand2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"
import { getAgentPagePath } from "@/lib/ai-agents-marketing"
import { useSession } from "@/lib/auth-client"
import { finnaPromptPath, signUpForFinnaPath } from "@/lib/safe-redirect"

const EXAMPLE_PROMPTS = [
  "Hire an AI CFO to model runway and investor updates",
  "Draft a contractor agreement and flag legal risk",
  "Plan this week's content calendar and launch posts",
  "Build a B2B outreach sequence for Series A prospects",
]

const ENHANCED_PROMPTS: Record<string, string> = {
  [EXAMPLE_PROMPTS[0]]:
    "Hire an AI CFO to model 18-month runway, burn, and a monthly investor update from our metrics",
  [EXAMPLE_PROMPTS[1]]:
    "Draft a contractor agreement, flag unusual terms, and list what to send legal before we sign",
  [EXAMPLE_PROMPTS[2]]:
    "Plan this week's content calendar, channel mix, and three launch posts for our raise",
  [EXAMPLE_PROMPTS[3]]:
    "Build a B2B outreach sequence for Series A prospects with objections, follow-ups, and CRM notes",
}

const HERO_AGENTS = AI_AGENTS_CATALOG.slice(0, 4).map((agent) => ({
  label: agent.name,
  href: getAgentPagePath(agent.id),
  img: { src: agent.imageSrc ?? "/cfo.png", alt: agent.name },
}))

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
  ctaHref = "/sign-up",
  ctaLabel = "Get Started",
}: {
  variant?: "marketing" | "embedded"
  onBegin?: () => void
  ctaHref?: string
  ctaLabel?: string
}) {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const videoRef = useRef<HTMLVideoElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPTS[0])
  const [promptIndex, setPromptIndex] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video || variant !== "marketing") return

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncPlayback = () => {
      if (motion.matches) {
        video.pause()
        return
      }
      void video.play().catch(() => {})
    }

    syncPlayback()
    motion.addEventListener("change", syncPlayback)
    return () => motion.removeEventListener("change", syncPlayback)
  }, [variant])

  const cyclePrompt = () => {
    const next = (promptIndex + 1) % EXAMPLE_PROMPTS.length
    setPromptIndex(next)
    setPrompt(EXAMPLE_PROMPTS[next])
  }

  const enhancePrompt = () => {
    setPrompt(ENHANCED_PROMPTS[prompt] ?? ENHANCED_PROMPTS[EXAMPLE_PROMPTS[promptIndex]] ?? prompt)
  }

  const submitPrompt = () => {
    const q = prompt.trim()
    if (!q) return
    if (!isPending && !session?.user) {
      router.push(signUpForFinnaPath(q))
      return
    }
    router.push(finnaPromptPath(q))
  }

  const scrollCards = (direction: -1 | 1) => {
    const node = scrollerRef.current
    if (!node) return
    node.scrollBy({ left: direction * (node.clientWidth * 0.7), behavior: "smooth" })
  }

  const ctaButton = ctaHref ? (
    <Button
      size="lg"
      className={cn(
        "rounded-full px-8 text-base font-semibold shadow-lg",
        variant === "marketing" ? "h-12 bg-[#4483f2] text-white hover:bg-[#3a75e0]" : "",
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
        variant === "marketing" ? "h-12 bg-[#4483f2] text-white hover:bg-[#3a75e0]" : "",
      )}
      onClick={onBegin}
    >
      {ctaLabel}
    </Button>
  )

  if (variant === "marketing") {
    return (
      <section className="relative isolate min-h-dvh overflow-hidden bg-neutral-950 max-sm:min-h-0 max-sm:overflow-visible">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/cfo.png"
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src="/trackifyai.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/70"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-neutral-950"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-end px-5 pb-16 pt-[6.5rem] text-center sm:px-8 sm:pb-20 sm:pt-28 lg:justify-center lg:pb-24 lg:pt-32">
          <h1 className="max-w-4xl text-balance text-[1.85rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl sm:leading-[1.08] lg:text-[3.35rem]">
            AI employees that never sleep
          </h1>

          <div className="mt-8 w-full rounded-[1.75rem] border border-white/70 bg-white/40 p-2.5 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:mt-10 sm:rounded-[2rem] sm:p-3.5">
            <form
              className="rounded-[1.35rem] bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:rounded-[1.5rem] sm:p-4"
              onSubmit={(event) => {
                event.preventDefault()
                submitPrompt()
              }}
            >
              <label htmlFor="ai-agents-hero-prompt" className="sr-only">
                Ask Finna
              </label>
              <textarea
                id="ai-agents-hero-prompt"
                rows={2}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    submitPrompt()
                  }
                }}
                className="w-full resize-none bg-transparent text-left text-[0.95rem] leading-relaxed text-neutral-800 outline-none placeholder:text-neutral-400 sm:text-base"
                placeholder="Ask Finna to hire an AI employee for finance, legal, sales, or marketing"
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={cyclePrompt}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50"
                    aria-label="Try another prompt"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.25} />
                  </button>
                  <button
                    type="button"
                    onClick={enhancePrompt}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 sm:px-3.5 sm:text-sm"
                  >
                    <Wand2 className="h-3.5 w-3.5 text-sky-500" />
                    <span className="hidden min-[380px]:inline">Enhance prompt</span>
                    <span className="min-[380px]:hidden">Enhance</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="hidden h-9 w-9 items-center justify-center rounded-full text-neutral-400 sm:inline-flex">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <button
                    type="submit"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-white shadow-sm transition-colors hover:bg-sky-500"
                    aria-label="Ask Finna"
                  >
                    <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </form>

            <div
              ref={scrollerRef}
              className="mt-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden"
            >
              {HERO_AGENTS.map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className="group min-w-[calc(50%-0.3rem)] snap-start overflow-hidden rounded-[0.95rem] border border-white/50 bg-white/55 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:min-w-[calc(33.333%-0.45rem)] sm:rounded-[1.1rem] lg:min-w-0 lg:flex-1"
                >
                  <div className="p-1 pb-0 sm:p-1.5 sm:pb-0">
                    <div className="aspect-[16/10] overflow-hidden rounded-[0.75rem] sm:rounded-[0.9rem]">
                      <img
                        src={card.img.src}
                        alt={card.img.alt}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                  </div>
                  <p className="px-2.5 py-1.5 text-left text-[0.7rem] font-medium tracking-tight text-neutral-800 sm:px-3 sm:py-2 sm:text-[0.8rem]">
                    {card.label}
                  </p>
                </Link>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 px-0.5 sm:mt-3.5">
              <Link
                href={ctaHref}
                className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-neutral-800 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-50 sm:h-11 sm:px-5"
              >
                Hire your AI team
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollCards(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-50"
                  aria-label="Previous agents"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCards(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-50"
                  aria-label="Next agents"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
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
          <h2 className="text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
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
