import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function FoundersPageSections() {
  return (
    <div className="bg-white text-neutral-950">
      <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24 xl:px-20">
        <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-950 px-6 py-14 text-white sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05] lg:order-1">
              <img
                src="/images/img2.PNG"
                alt="Founder workspace — startup profile, pitch deck, and company structure"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <Badge
                variant="secondary"
                className="mb-4 border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white"
              >
                For Founders
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Build a company profile investors can trust
              </h2>
              <p className="mb-6 text-base leading-relaxed text-white/60 sm:text-lg">
                Keep your startup story, pitch materials, and company structure in one place — ready to share when the right conversation starts.
              </p>
              <ul className="mb-8 space-y-4">
                {[
                  "Startup profile with your story, traction, and team",
                  "Pitch deck organized and ready to send",
                  "Company structure, roles, and equity in one view",
                  "Cap table and stakeholder records that stay current",
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
                  Build your profile, it&apos;s free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

