import Link from "next/link"

import { IncorporateHero } from "@/components/incorporate/incorporate-hero"
import { IncorporateHub } from "@/components/incorporate/incorporate-hub"
import { MarketingFooter } from "@/components/marketing-footer"
import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import { Button } from "@/components/ui/button"
import { INCORPORATE_STEPS } from "@/lib/incorporate-content"

export function IncorporatePageContent() {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="pointer-events-auto">
          <TrackifyVcNavbar />
        </div>
      </div>

      <main>
        <IncorporateHero />
        <IncorporateHub />

        <section className="border-t border-neutral-200 bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <ol className="mt-12 grid gap-8 sm:grid-cols-3">
              {INCORPORATE_STEPS.map((step) => (
                <li key={step.n}>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                    {step.n}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 rounded-[1.75rem] border border-neutral-200 bg-neutral-950 px-6 py-12 text-white sm:px-10 sm:py-14 lg:flex-row lg:items-center">
            <div className="max-w-lg">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Already incorporating? Open Trackify next.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
                Formation happens in your Trackify dashboard via Palm. Your books, raise, and data room live here.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-neutral-950 hover:bg-white/90"
                asChild
              >
                <Link href="/founder/incorporate">Start U.S. formation</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/sign-up">Create a Trackify account</Link>
              </Button>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-5xl text-xs leading-relaxed text-neutral-400">
            Company formation, EIN applications, and registered-agent services are filed through
            Palm. Trackify does not provide legal or tax advice.
          </p>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
