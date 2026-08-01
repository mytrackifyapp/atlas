"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

import Wrapper from "@/components/trackifyvc/global/wrapper"
import Container from "@/components/trackifyvc/global/container"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function TrackifyVcOriginalCta({
  ctaHref = "/sign-up",
  ctaLabel = "Get Started",
  variant = "dark",
  className,
}: {
  ctaHref?: string
  ctaLabel?: string
  variant?: "dark" | "light"
  className?: string
}) {
  const isLight = variant === "light"

  if (isLight) {
    return (
      <section
        className={cn(
          "w-full border-t border-neutral-200 bg-white px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20 xl:px-20",
          className,
        )}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
              Get started for free
            </h2>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                <span className="text-sm font-medium text-neutral-600">Free plan available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                <span className="text-sm font-medium text-neutral-600">No credit card required</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button size="lg" className="rounded-full px-8 font-semibold" asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
            <p className="text-sm leading-relaxed text-neutral-500">
              4.80/5 from 300+ reviews
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-14 lg:py-20">
      <div className="absolute inset-x-0 bottom-0 mx-auto h-1/12 w-1/3 rounded-full bg-primary/50 blur-[4rem] lg:bg-primary/70" />

      <Wrapper>
        <div className="grid w-full grid-cols-1 gap-10 py-4 lg:grid-cols-2 lg:gap-8 lg:py-8">
          <div className="flex w-full flex-col items-start justify-center">
            <Container className="mx-auto w-max lg:mx-0">
              <h2 className="bg-gradient-to-b from-neutral-100 to-neutral-400 bg-clip-text text-3xl font-semibold leading-tight text-transparent lg:text-5xl">
                Get started <br /> for free
              </h2>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-white/80">Free plan available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-white/80">No credit card required</span>
                </div>
              </div>
            </Container>
          </div>

          <div className="mt-2 flex w-full flex-col justify-center lg:mt-0">
            <Container className="mx-auto w-max lg:mx-0">
              <div className="mt-0 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button size="lg" className="rounded-full px-8 font-semibold" asChild>
                  <Link href={ctaHref}>{ctaLabel}</Link>
                </Button>
                <p className="text-sm leading-relaxed text-white/50">
                  4.80/5 <br /> From 300+ Customer Reviews
                </p>
              </div>
            </Container>
          </div>
        </div>
      </Wrapper>
    </div>
  )
}
