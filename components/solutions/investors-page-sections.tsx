import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  Database,
  Globe2,
  Link2,
  Network,
  Workflow,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const INVESTOR_WHAT_YOU_GET = [
  {
    title: "Portfolio intelligence",
    description:
      "Track performance, exposure, and momentum across every company without rebuilding the same report.",
    icon: Briefcase,
    iconClass: "text-sky-500",
  },
  {
    title: "Deal flow pipeline",
    description:
      "Score opportunities, manage stages, and move faster from first meeting to term sheet.",
    icon: Workflow,
    iconClass: "text-pink-500",
  },
  {
    title: "Network intelligence",
    description:
      "See who you know, who to meet, and where warm paths exist across the Trackify ecosystem.",
    icon: Network,
    iconClass: "text-violet-500",
  },
  {
    title: "Market insights",
    description:
      "Follow sector trends and competitive signals across Africa so diligence starts with context.",
    icon: Globe2,
    iconClass: "text-emerald-500",
  },
  {
    title: "LP-ready reporting",
    description:
      "Share allocations, performance, and updates without exporting another spreadsheet.",
    icon: BarChart3,
    iconClass: "text-amber-500",
  },
  {
    title: "AI analysis",
    description:
      "Use Finna to summarize memos, flag risk, and keep investment committee work moving.",
    icon: Brain,
    iconClass: "text-red-500",
  },
]

const STAGES = [
  {
    number: "01",
    title: "Pre-Seed & Seed",
    description: "First checks, thesis fit, and early traction.",
    href: "/stages/pre-seed-seed",
  },
  {
    number: "02",
    title: "Series A",
    description: "Product-market fit and the path to scale.",
    href: "/stages/series-a",
  },
  {
    number: "03",
    title: "Growth",
    description: "Expansion, follow-ons, and market position.",
    href: "/stages/growth",
  },
  {
    number: "04",
    title: "Late stage & exit",
    description: "Liquidity, IPO prep, and acquisition paths.",
    href: "/stages/late-stage-exit",
  },
]

export function InvestorsPageSections() {
  return (
    <div className="bg-white text-neutral-950">
      <section
        id="what-you-get"
        className="w-full px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24 xl:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium text-sky-500 sm:text-base">What you get</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              A workspace built for how investment teams actually work
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-5">
            {INVESTOR_WHAT_YOU_GET.map((item) => {
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

      <section className="px-6 pb-16 sm:px-10 sm:pb-20 lg:px-14 lg:pb-24 xl:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              Explore, connect, and invest in the next big thing
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-500 sm:text-lg">
              Built for investors across Africa. Trackify brings deal flow and founder relationships into one place so you get closer to the right companies, faster.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-2 lg:gap-5">
            <article className="flex flex-col rounded-2xl bg-neutral-100 p-7 sm:p-9">
              <Database className="h-8 w-8 text-sky-500" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
                Discover the best startups
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-500 sm:text-base">
                Expand your deal flow and uncover companies that match your thesis. Use stage, sector, and traction data to diligence with more context — not another scattered inbox.
              </p>
              <Link
                href="/companies"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
              >
                Browse the library
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>

            <article className="flex flex-col rounded-2xl bg-neutral-100 p-7 sm:p-9">
              <Link2 className="h-8 w-8 text-sky-500" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
                Connect with founders
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-500 sm:text-base">
                Reach founders on Trackify when a company fits. Review their profile and pitch, request an intro, and keep the conversation in one workspace from first note to term sheet.
              </p>
              <Link
                href="/sign-up"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
              >
                Join now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-10 sm:pb-20 lg:px-14 lg:pb-24 xl:px-20">
        <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-950 px-6 py-14 text-white sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Badge
                variant="secondary"
                className="mb-4 border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white"
              >
                For Investors
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                See every company and every round in one view
              </h2>
              <p className="mb-6 text-base leading-relaxed text-white/60 sm:text-lg">
                Diligence, portfolio tracking, and LP reporting live together — so your team stops jumping between tools.
              </p>
              <ul className="mb-8 space-y-4">
                {[
                  "Portfolio performance across every holding",
                  "Deal flow from first intro to term sheet",
                  "Notes, memos, and IC-ready collaboration",
                  "LP reports without extra spreadsheets",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.07]">
                      <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-white/65">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="bg-white text-neutral-950 hover:bg-white/90">
                <Link href="/sign-up">
                  Get started, it&apos;s free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05]">
              <img
                src="/images/img1.PNG"
                alt="Investor dashboard — portfolio analytics, deal flow, and market intelligence"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-10 sm:pb-20 lg:px-14 lg:pb-24 xl:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Startup library
              </h2>
              <p className="mt-4 text-base text-neutral-500 sm:text-lg">
                Browse companies by stage — from first check to exit.
              </p>
            </div>
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-950 transition-colors hover:text-neutral-600"
            >
              View all companies
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {STAGES.map((stage) => (
              <Link
                key={stage.href}
                href={stage.href}
                className="group rounded-2xl bg-neutral-100 p-6 transition-colors hover:bg-neutral-200/70 sm:p-7"
              >
                <p className="text-xs font-medium tracking-[0.14em] text-neutral-400">
                  {stage.number}
                </p>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-950">
                  {stage.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {stage.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-950">
                  Explore
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
