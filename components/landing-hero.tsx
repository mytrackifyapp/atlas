"use client"

import Link from "next/link"
import { useState } from "react"

import { MarketingGlassNavbar } from "@/components/marketing-glass-navbar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    <section id="home" className="relative min-h-[100svh] w-full overflow-hidden bg-black text-white">
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

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] max-w-[1400px] flex-col justify-end px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-[2.25rem] font-semibold leading-[1.08] tracking-tight sm:text-[3.25rem] lg:text-[3.75rem] lg:leading-[1.05]">
              Building the future
              <br />
              of venture in Africa.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:mt-5 sm:text-lg">
              We are venture operators creating an optimistic tomorrow for founders
              and investors finance, fundraising, and AI in one place.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <Button
                asChild
                className="h-12 rounded-full bg-white px-8 text-base font-semibold text-black hover:bg-white/90"
              >
                <Link href={primaryHref}>{primaryLabel === "Sign up" ? "Get In Touch" : primaryLabel}</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-12 rounded-full px-8 text-base font-medium text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/solutions/investors">Learn more</Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-start lg:justify-end">
            <div
              className={cn(
                "inline-flex rounded-full border border-white/20 bg-black/35 px-6 py-3",
                "text-base font-medium text-white/85 backdrop-blur-md",
              )}
            >
              Finance. Fundraising. AI.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
