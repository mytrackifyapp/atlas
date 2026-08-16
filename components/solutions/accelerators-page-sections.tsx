import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Calendar,
  LayoutDashboard,
  Presentation,
  Users,
  Waypoints,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PROGRAM_FEATURES = [
  {
    title: "Cohort dashboards",
    description:
      "See fundraising, metrics, and milestones across every company in the batch — without chasing updates.",
    icon: LayoutDashboard,
    iconClass: "text-sky-500",
  },
  {
    title: "Program playbooks",
    description:
      "Standardize how founders report, prep for demo day, and show up investor-ready week after week.",
    icon: BookOpen,
    iconClass: "text-pink-500",
  },
  {
    title: "Mentor operations",
    description:
      "Match mentors, track sessions, and keep office hours from slipping through a spreadsheet.",
    icon: Users,
    iconClass: "text-violet-500",
  },
  {
    title: "Demo day prep",
    description:
      "Collect decks, profiles, and traction in one place so the room sees a consistent cohort story.",
    icon: Presentation,
    iconClass: "text-emerald-500",
  },
  {
    title: "Batch calendar",
    description:
      "Workshops, deadlines, and check-ins live on one timeline founders and operators actually use.",
    icon: Calendar,
    iconClass: "text-amber-500",
  },
  {
    title: "Portfolio visibility",
    description:
      "Follow alumni after the program with the same reporting investors expect from a fund.",
    icon: Waypoints,
    iconClass: "text-red-500",
  },
]

export function AcceleratorsPageSections() {
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
              The operating layer for every cohort you run
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-5">
            {PROGRAM_FEATURES.map((item) => {
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
              Support founders. Report with clarity.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-500 sm:text-lg">
              Trackify gives accelerator operators one workspace for the program and a view LPs, partners, and mentors can actually use.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-2 lg:gap-5">
            <article className="flex flex-col rounded-2xl bg-neutral-100 p-7 sm:p-9">
              <Users className="h-8 w-8 text-sky-500" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
                Keep every founder on track
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-500 sm:text-base">
                Profiles, pitch decks, metrics, and weekly updates live in one place. Mentors see progress. Founders stop rebuilding the same report for every check-in.
              </p>
              <Link
                href="/solutions/founders"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
              >
                See the founder workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>

            <article className="flex flex-col rounded-2xl bg-neutral-100 p-7 sm:p-9">
              <LayoutDashboard className="h-8 w-8 text-sky-500" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
                Run the program like a portfolio
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-500 sm:text-base">
                Batch-level dashboards, demo-day materials, and alumni tracking — so partners and investors get a clear picture of the cohort, not a folder of decks.
              </p>
              <Link
                href="/sign-up"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
              >
                Talk to our team
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
                For Accelerators
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Put the next cohort on Trackify
              </h2>
              <p className="mb-6 text-base leading-relaxed text-white/60 sm:text-lg">
                Give founders a real workspace from week one, and give your team visibility from application to demo day.
              </p>
              <ul className="mb-8 space-y-4">
                {[
                  "Cohort-wide reporting without chasing spreadsheets",
                  "Founder profiles, decks, and metrics in one view",
                  "Playbooks for check-ins, fundraising, and demo day",
                  "Alumni visibility after the program ends",
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
                <Link href="/contact">
                  Talk to our team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05]">
              <img
                src="/images/img1.PNG"
                alt="Accelerator program — cohort reporting and founder support"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
