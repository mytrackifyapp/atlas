"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import TrackifyVcOriginalCta from "@/components/trackifyvc/original-cta"
import { Button } from "@/components/ui/button"
import type { SolutionContent } from "@/lib/solutions-content"
import { SOLUTIONS } from "@/lib/solutions-content"
import { cn } from "@/lib/utils"

export function SolutionPageContent({ solution }: { solution: SolutionContent }) {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <TrackifyVcNavbar />

      <main>
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

      </main>

      <footer className="w-full border-t border-neutral-200 bg-white">
        <section className="px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-neutral-400">
            Explore solutions
          </p>
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
            {SOLUTIONS.map((item) => (
              <Link
                key={item.slug}
                href={`/solutions/${item.slug}`}
                className={cn(
                  "rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:px-5 sm:py-3 sm:text-base",
                  item.slug === solution.slug
                    ? "bg-neutral-950 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <TrackifyVcOriginalCta
          ctaHref={solution.ctaHref}
          ctaLabel={solution.ctaLabel}
          variant="light"
          className="border-t-0"
        />
      </footer>
    </div>
  )
}
