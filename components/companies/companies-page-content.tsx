"use client"

import { useMemo, useState } from "react"

import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import TrackifyVcOriginalCta from "@/components/trackifyvc/original-cta"
import { MarketingFooter } from "@/components/marketing-footer"
import {
  COMPANIES_DIRECTORY,
  COMPANY_FOCUSES,
  focusLabel,
  type CompanyFocus,
} from "@/lib/companies-directory"
import { cn } from "@/lib/utils"

function CompanyRow({ company }: { company: (typeof COMPANIES_DIRECTORY)[number] }) {
  return (
    <article className="group grid gap-6 border-b border-neutral-200/80 py-10 transition-colors hover:bg-neutral-50/60 sm:grid-cols-[minmax(180px,0.9fr)_minmax(0,2fr)_auto] sm:items-center sm:gap-10 lg:gap-16 xl:gap-20">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-[1.75rem] lg:text-3xl">
        {company.name}
      </h2>

      <p className="max-w-3xl text-base leading-relaxed text-neutral-500 sm:text-lg lg:text-xl lg:leading-relaxed">
        {company.description}
      </p>

      <div className="sm:flex sm:justify-end">
        <span className="inline-flex rounded-full bg-neutral-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-700 transition-colors group-hover:bg-neutral-200/70 sm:text-[13px]">
          {focusLabel(company.focus)}
        </span>
      </div>
    </article>
  )
}

export function CompaniesPageContent() {
  const [focus, setFocus] = useState<CompanyFocus>("All")

  const companies = useMemo(() => {
    if (focus === "All") return COMPANIES_DIRECTORY
    return COMPANIES_DIRECTORY.filter((company) => company.focus === focus)
  }, [focus])

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <TrackifyVcNavbar />

      <main className="w-full px-6 pb-24 pt-8 sm:px-10 sm:pt-12 lg:px-14 lg:pt-16 xl:px-20">
        <header className="border-b border-neutral-200 pb-10 lg:pb-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Companies
              </h1>
              <p className="mt-4 text-lg text-neutral-500 sm:text-xl lg:mt-5">
                {companies.length} companies building on Trackify.
              </p>
            </div>

            <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 sm:gap-2.5">
              {COMPANY_FOCUSES.map((item) => {
                const active = focus === item
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFocus(item)}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:px-5 sm:py-3 sm:text-base",
                      active
                        ? "bg-neutral-950 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900",
                    )}
                  >
                    {item === "All" ? "All" : item}
                  </button>
                )
              })}
            </div>
          </div>
        </header>

        <div>
          {companies.length > 0 ? (
            companies.map((company) => <CompanyRow key={company.id} company={company} />)
          ) : (
            <p className="py-24 text-center text-lg text-neutral-500">
              No companies match this focus yet.
            </p>
          )}
        </div>
      </main>

      <TrackifyVcOriginalCta variant="light" />
      <MarketingFooter />
    </div>
  )
}
