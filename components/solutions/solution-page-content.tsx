"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Check,
  FolderLock,
  Landmark,
  Network,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { MarketingFooter } from "@/components/marketing-footer"
import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import TrackifyVcOriginalCta from "@/components/trackifyvc/original-cta"
import { AcceleratorsHero } from "@/components/solutions/accelerators-hero"
import { AcceleratorsPageSections } from "@/components/solutions/accelerators-page-sections"
import { FoundersHero } from "@/components/solutions/founders-hero"
import { FoundersPageSections } from "@/components/solutions/founders-page-sections"
import { INVESTOR_STAKEHOLDER_CARDS } from "@/components/solutions/investor-stakeholders"
import { InvestorsPageSections } from "@/components/solutions/investors-page-sections"
import { Button } from "@/components/ui/button"
import { Marquee } from "@/components/ui/marquee"
import type { SolutionContent } from "@/lib/solutions-content"
import { cn } from "@/lib/utils"

const FOUNDER_WHAT_YOU_GET: {
  title: string
  description: string
  icon: LucideIcon
  iconClass: string
}[] = [
  {
    title: "Investor pipeline",
    description:
      "Track every conversation, follow-up, and commitment so nothing slips between first intro and close.",
    icon: Network,
    iconClass: "text-sky-500",
  },
  {
    title: "Fundraising",
    description:
      "See committed capital, round progress, and remaining gap at a glance as you move toward target.",
    icon: Landmark,
    iconClass: "text-pink-500",
  },
  {
    title: "Data room",
    description:
      "Share pitch decks, financials, and legal docs with investors under full control and auditability.",
    icon: FolderLock,
    iconClass: "text-violet-500",
  },
  {
    title: "Finance",
    description:
      "Watch cash, budgets, and runway in one place so you always know how long you can operate.",
    icon: Wallet,
    iconClass: "text-emerald-500",
  },
  {
    title: "Metrics",
    description:
      "Report the KPIs and milestones investors actually ask for, without rebuilding the same update every month.",
    icon: BarChart3,
    iconClass: "text-amber-500",
  },
  {
    title: "AI team",
    description:
      "Specialists for finance, legal, sales, and ops that help you prepare, follow up, and keep the raise moving.",
    icon: Sparkles,
    iconClass: "text-red-500",
  },
]

export function SolutionPageContent({ solution }: { solution: SolutionContent }) {
  const isInvestors = solution.slug === "investors"
  const isFounders = solution.slug === "founders"
  const isAccelerators = solution.slug === "accelerators"
  const overlayNav = isInvestors || isFounders || isAccelerators

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      {overlayNav ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
          <div className="pointer-events-auto">
            <TrackifyVcNavbar />
          </div>
        </div>
      ) : (
        <TrackifyVcNavbar />
      )}

      <main>
        {solution.slug === "founders" ? (
          <FoundersHero solution={solution} />
        ) : solution.slug === "investors" ? (
          <InvestorsHero solution={solution} />
        ) : solution.slug === "accelerators" ? (
          <AcceleratorsHero solution={solution} />
        ) : (
          <section className="w-full border-b border-neutral-200 px-6 pb-16 pt-8 sm:px-10 sm:pb-20 sm:pt-12 lg:px-14 lg:pb-24 lg:pt-16 xl:px-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-24">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  {solution.label}
                </p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  {solution.headline}
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-500 sm:text-xl">
                  {solution.description}
                </p>

                <ul className="mt-8 space-y-3">
                  {solution.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-base text-neutral-700 sm:text-lg">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-950">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button asChild size="lg" className="mt-10 rounded-full px-8">
                  <Link href={solution.ctaHref}>
                    {solution.ctaLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {solution.image ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-sm">
                  <Image
                    src={solution.image}
                    alt={solution.imageAlt ?? solution.headline}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : null}
            </div>
          </section>
        )}

        {solution.slug === "founders" ? (
          <>
            <FoundersStartups />
            <FoundersWhatYouGet />
            <FoundersPageSections />
          </>
        ) : solution.slug === "investors" ? (
          <InvestorsPageSections />
        ) : solution.slug === "accelerators" ? (
          <AcceleratorsPageSections />
        ) : (
          <section className="w-full px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24 xl:px-20">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                What you get
              </h2>
              <p className="mt-4 text-lg text-neutral-500 sm:text-xl">
                Everything {solution.label.toLowerCase()} need to move faster on Trackify.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
              {solution.highlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-8 transition-colors hover:bg-neutral-50"
                >
                  <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-neutral-500 sm:text-lg">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

      </main>

      <footer className="w-full border-t border-neutral-200 bg-white">
        <TrackifyVcOriginalCta
          ctaHref="/sign-up"
          ctaLabel="Get started"
          variant="light"
          className="border-t-0"
        />
      </footer>
      <MarketingFooter />
    </div>
  )
}

function InvestorsHero({ solution }: { solution: SolutionContent }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

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
  }, [])

  return (
    <section className="relative isolate min-h-dvh overflow-hidden bg-neutral-950 max-sm:min-h-0 max-sm:overflow-visible">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover object-[center_28%] sm:object-center"
      >
        <source src="/investor.mp4" type="video/mp4" />
      </video>
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/70 sm:from-black/45 sm:via-black/30 sm:to-black/65"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white sm:h-32"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col justify-end gap-8 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[5.75rem] sm:gap-10 sm:px-10 sm:pb-12 sm:pt-28 lg:justify-center lg:px-14 lg:pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-[1.85rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl sm:leading-[1.1] lg:text-[3.5rem] lg:leading-[1.08]">
            {solution.headline}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-[0.95rem] leading-relaxed text-white/75 sm:mt-6 sm:text-lg">
            {solution.description}
          </p>
          <div className="mt-7 flex w-full flex-col items-stretch gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
            <Button
              asChild
              className="h-12 w-full rounded-full bg-white px-8 text-base font-semibold text-black hover:bg-white/90 sm:w-auto"
            >
              <Link href={solution.ctaHref}>
                Explore dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-12 w-full rounded-full px-8 text-base font-medium text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <Link href="#what-you-get">See what you get</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          {INVESTOR_STAKEHOLDER_CARDS.map((card) => (
            <Link
              key={card.tag}
              href={card.href}
              className="group overflow-hidden rounded-[1.15rem] border border-white/25 bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:rounded-[1.5rem]"
            >
              <div className="p-1.5 pb-0 sm:p-2 sm:pb-0">
                <div className="aspect-[16/10] overflow-hidden rounded-[0.9rem] sm:rounded-[1.15rem]">
                  <img
                    src={card.img.src}
                    alt={card.img.alt}
                    className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.04] ${card.img.className}`}
                  />
                </div>
              </div>
              <p className="px-3 py-2 text-[0.75rem] font-medium tracking-tight text-white sm:px-4 sm:py-3 sm:text-sm">
                {card.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

const FOUNDER_STARTUPS: {
  name: string
  wordmark: string
  wordmarkClass: string
}[] = [
  {
    name: "Rizflow",
    wordmark: "rizflow",
    wordmarkClass: "text-[1.05rem] font-semibold tracking-tight lowercase",
  },
  {
    name: "Moodify",
    wordmark: "MOODIFY",
    wordmarkClass: "text-[0.95rem] font-bold tracking-[0.14em]",
  },
  {
    name: "CarFusion",
    wordmark: "CarFusion",
    wordmarkClass: "text-[1.05rem] font-semibold tracking-tight",
  },
  {
    name: "Payollar",
    wordmark: "payollar",
    wordmarkClass: "text-[1.05rem] font-semibold tracking-tight lowercase",
  },
  {
    name: "Rizzbrand",
    wordmark: "rizzbrand",
    wordmarkClass: "text-[1rem] font-semibold tracking-tight lowercase",
  },
]

const FOUNDER_AVATARS = [
  { src: "/testimonials/amina.png", alt: "Amina" },
  { src: "/testimonials/david.png", alt: "David" },
  { src: "/testimonials/nana.png", alt: "Nana" },
  { src: "/testimonials/elvis.png", alt: "Elvis" },
] as const

function FoundersStartups() {
  return (
    <section
      className="w-full overflow-hidden bg-white py-12 sm:py-14 lg:py-16"
      aria-label="Startups on Trackify"
    >
      <div className="flex items-center justify-center gap-3 px-6">
        <div className="flex items-center -space-x-2">
          {FOUNDER_AVATARS.map((person) => (
            <span
              key={person.src}
              className="relative inline-flex h-7 w-7 overflow-hidden rounded-full border-2 border-white bg-neutral-200 sm:h-8 sm:w-8"
            >
              <Image
                src={person.src}
                alt={person.alt}
                fill
                className="object-cover"
                sizes="32px"
              />
            </span>
          ))}
        </div>
        <p className="text-sm text-neutral-400 sm:text-[0.95rem]">
          Used by founders building on Trackify
        </p>
      </div>
      <div className="relative mt-8 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] sm:mt-10">
        <Marquee pauseOnHover className="[--duration:40s] [--gap:3.5rem] p-0 sm:[--gap:4.5rem]">
          {FOUNDER_STARTUPS.map((startup) => (
            <p
              key={startup.name}
              className={cn("shrink-0 text-neutral-400", startup.wordmarkClass)}
            >
              {startup.wordmark}
            </p>
          ))}
        </Marquee>
      </div>
    </section>
  )
}

function FoundersWhatYouGet() {
  return (
    <section
      id="what-you-get"
      className="w-full bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24 xl:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-sky-500 sm:text-base">What you get</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            We designed a workspace that works harder for your raise
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-5">
          {FOUNDER_WHAT_YOU_GET.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className="rounded-2xl bg-neutral-100 p-7 sm:p-8">
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("h-5 w-5 shrink-0", item.iconClass)} strokeWidth={2} aria-hidden />
                  <h3 className="text-base font-semibold tracking-tight text-neutral-950 sm:text-lg">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500 sm:text-[0.95rem]">
                  {item.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
