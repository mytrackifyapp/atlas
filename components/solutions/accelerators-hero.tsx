import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SolutionContent } from "@/lib/solutions-content"

export function AcceleratorsHero({ solution }: { solution: SolutionContent }) {
  return (
    <section className="relative isolate min-h-dvh overflow-hidden bg-neutral-950 max-sm:min-h-0">
      <img
        src="/images/img1.PNG"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/80"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-end px-5 pb-16 pt-[6.5rem] text-center sm:px-8 sm:pb-20 sm:pt-28 lg:justify-center lg:pb-24 lg:pt-32">
        <h1 className="text-balance text-[1.85rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl sm:leading-[1.08] lg:text-[3.35rem]">
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
            <Link href="/contact">
              Talk to our team
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
    </section>
  )
}
