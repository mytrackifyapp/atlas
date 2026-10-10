"use client"

import Link from "next/link"

import { LandingAudienceCards } from "@/components/landing-audience-cards"
import { MarketingGlassNavbar } from "@/components/marketing-glass-navbar"
import { Button } from "@/components/ui/button"

export function LandingHero({
  isAuthenticated,
  hasCompletedOnboarding,
  dashboardUrl,
}: {
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  dashboardUrl: string
}) {
  const primaryHref = isAuthenticated ? dashboardUrl : "/sign-up"
  const primaryLabel = isAuthenticated
    ? hasCompletedOnboarding
      ? "Dashboard"
      : "Onboarding"
    : "Sign up"

  return (
    <section id="home" className="relative min-h-dvh w-full overflow-hidden bg-black text-white max-sm:min-h-0 max-sm:overflow-visible">
      <img
        src="/bg-04.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/65"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/25"
        aria-hidden
      />

      <MarketingGlassNavbar primaryHref={primaryHref} primaryLabel={primaryLabel} />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.75rem)] max-w-[1400px] flex-col justify-end px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 sm:min-h-[calc(100svh-5rem)] sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <h1 className="text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-[3.25rem] lg:text-[3.75rem] lg:leading-[1.05]">
              Building the future
              <br />
              of venture in Africa.
            </h1>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-white/80 sm:mt-5 sm:text-lg">
              We are venture operators creating an optimistic tomorrow for founders
              and investors finance, fundraising, and AI in one place.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3">
              <Button
                asChild
                className="h-12 w-full rounded-full bg-white px-8 text-base font-semibold text-black hover:bg-white/90 sm:w-auto"
              >
                <Link href={primaryHref}>{primaryLabel === "Sign up" ? "Get started" : primaryLabel}</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-12 w-full rounded-full px-8 text-base font-medium text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <Link href="/contact">Talk to sales</Link>
              </Button>
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch lg:w-auto lg:items-end">
            <LandingAudienceCards />
          </div>
        </div>
      </div>
    </section>
  )
}

