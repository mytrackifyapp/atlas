"use client"

import { AcceleratorApplyCard } from "@/components/accelerator-apply-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const COHORT_NAME = "Trackify Finance 2026"
const COHORT_LAUNCH_MONTH = "November"

const HERO_FACES = [
  { src: "/accelerator/founder-1.jpg", alt: "Founder" },
  { src: "/accelerator/founder-2.jpg", alt: "Founder" },
  { src: "/accelerator/founder-3.jpg", alt: "Founder" },
]

const BENEFITS = [
  { icon: "💰", title: "Capital Access" },
  { icon: "⚡", title: "Platform Credits" },
  { icon: "🌍", title: "Global Exposure" },
  { icon: "🏆", title: "Investor Pitch" },
]

export function AcceleratorDashboard() {
  return (
    <div className="relative -mx-3 -mb-[calc(6.25rem+env(safe-area-inset-bottom))] -mt-3 min-h-[calc(100vh-3.5rem)] pb-[calc(6.25rem+env(safe-area-inset-bottom))] lg:-mx-6 lg:-mb-6 lg:-mt-6 lg:pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_-8%,#dbe7ff_0%,#eef2ff_36%,#fff7fb_68%,#ffffff_100%)] dark:bg-[radial-gradient(120%_70%_at_50%_-8%,#1e293b_0%,#171717_55%,#0a0a0a_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#94a3b8_0.7px,transparent_0.7px)] [background-size:18px_18px] dark:opacity-20"
      />

      <section className="relative isolate px-4 pb-10 pt-14 sm:px-8 sm:pt-20 lg:px-12 lg:pt-24">
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-sm text-neutral-500">Welcome to the Trackify accelerator</p>
          <h1 className="mt-4 text-balance text-[2.1rem] font-semibold leading-[1.12] tracking-tight text-neutral-950 dark:text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
            Discover the next
            <br />
            Top-Rated{" "}
            <span className="inline-flex translate-y-1 items-center -space-x-2 align-middle">
              {HERO_FACES.map((face) => (
                <Avatar
                  key={face.src}
                  className="h-9 w-9 border-2 border-white sm:h-11 sm:w-11 dark:border-neutral-900"
                >
                  <AvatarImage src={face.src} alt={face.alt} className="object-cover object-top" />
                  <AvatarFallback className="bg-neutral-200 text-[10px] font-semibold text-neutral-600">
                    •
                  </AvatarFallback>
                </Avatar>
              ))}
            </span>{" "}
            founders here!
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-500 sm:text-base">
            {COHORT_NAME} launches in {COHORT_LAUNCH_MONTH} 2026. Apply to join a 12-week cohort for
            finance builders across Africa.
          </p>
          <Button
            asChild
            className="mt-7 h-11 rounded-full bg-neutral-950 px-7 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <a href="#apply">Apply now</a>
          </Button>
        </div>

        <AcceleratorApplyCard />
      </section>

      <section className="relative px-4 pb-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            What you’ll get
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((item) => (
              <article
                key={item.title}
                className="flex items-center gap-3 rounded-2xl border border-black/[0.05] bg-white p-4 dark:border-white/10 dark:bg-[#171717]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-lg dark:bg-neutral-900">
                  {item.icon}
                </span>
                <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                  {item.title}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
