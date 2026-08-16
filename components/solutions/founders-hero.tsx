"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Wand2,
} from "lucide-react"

import type { SolutionContent } from "@/lib/solutions-content"
import { useSession } from "@/lib/auth-client"
import { finnaPromptPath, signUpForFinnaPath } from "@/lib/safe-redirect"

const EXAMPLE_PROMPTS = [
  "Help me prepare my seed round and investor pipeline",
  "Build a data room checklist for our Series A",
  "Draft an investor update from this month's metrics",
  "Map my cap table and remaining option pool",
]

const ENHANCED_PROMPTS: Record<string, string> = {
  [EXAMPLE_PROMPTS[0]]:
    "Help me prepare my seed round: target raise, investor pipeline stages, data room, and a 12-month plan",
  [EXAMPLE_PROMPTS[1]]:
    "Build a Series A data room checklist covering financials, legal, product, and traction",
  [EXAMPLE_PROMPTS[2]]:
    "Draft a concise investor update with metrics, highlights, asks, and next milestones",
  [EXAMPLE_PROMPTS[3]]:
    "Map my cap table, option pool, and dilution across a seed and Series A",
}

const FOUNDER_HERO_CARDS = [
  {
    label: "Investor Pipeline",
    href: "/founder/investors",
    img: { src: "/images/img2.PNG", alt: "Investor pipeline" },
  },
  {
    label: "Fundraising",
    href: "/founder/fundraising",
    img: { src: "/images/img3.PNG", alt: "Fundraising tracker" },
  },
  {
    label: "Data Room",
    href: "/founder/documents",
    img: { src: "/images/img4.PNG", alt: "Secure data room" },
  },
  {
    label: "Finance",
    href: "/founder/finance",
    img: { src: "/images/img5.jpg", alt: "Finance workspace" },
  },
]

export function FoundersHero({ solution }: { solution: SolutionContent }) {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPTS[0])
  const [promptIndex, setPromptIndex] = useState(0)

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

  return (
    <section className="relative isolate overflow-hidden bg-[#d9cfc4]">
      <img
        src="/hero/founder-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 pt-[6.5rem] text-center sm:px-8 sm:pb-20 sm:pt-28 lg:min-h-dvh lg:justify-center lg:pb-24 lg:pt-32">
        <h1 className="max-w-4xl text-balance text-[2rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl sm:leading-[1.08] lg:text-[3.35rem]">
          {solution.headline}
        </h1>

        <div className="mt-8 w-full rounded-[1.75rem] border border-white/70 bg-white/40 p-2.5 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:mt-10 sm:rounded-[2rem] sm:p-3.5">
          <form
            className="rounded-[1.35rem] bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:rounded-[1.5rem] sm:p-4"
            onSubmit={(event) => {
              event.preventDefault()
              submitPrompt()
            }}
          >
            <label htmlFor="founder-hero-prompt" className="sr-only">
              Ask Finna
            </label>
            <textarea
              id="founder-hero-prompt"
              rows={2}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  submitPrompt()
                }
              }}
              className="w-full resize-none bg-transparent text-[0.95rem] leading-relaxed text-neutral-800 outline-none placeholder:text-neutral-400 sm:text-base"
              placeholder="Ask Finna to help you raise, run finance, or prep your data room"
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
            {FOUNDER_HERO_CARDS.map((card) => (
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
              href={solution.ctaHref}
              className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-neutral-800 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-50 sm:h-11 sm:px-5"
            >
              Explore dashboard
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCards(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-50"
                aria-label="Previous workspaces"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCards(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-50"
                aria-label="Next workspaces"
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
