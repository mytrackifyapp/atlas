"use client"

import Container from "@/components/trackifyvc/global/container"
import Icons from "@/components/trackifyvc/global/icons"
import Wrapper from "@/components/trackifyvc/global/wrapper"
import { Button } from "@/components/ui/button"

export default function OurStart() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-16 lg:py-24">
      <Wrapper>
        <div className="flex flex-col items-start justify-start md:items-center md:justify-center">
          <Container>
            <div className="flex items-center justify-center gap-x-1 px-2 py-1.5 relative w-max rounded-full before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700 before:to-neutral-900 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/60">
              <Icons.stars className="size-5" />
              <span className="text-sm text-white">Our Start</span>
            </div>
          </Container>
          <Container delay={0.1} className="flex grow">
            <h2 className="text-3xl md:text-4xl font-semibold text-left md:text-center mt-4">
              How Trackify got Started
            </h2>
          </Container>
          <Container delay={0.3} className="max-w-2xl mx-auto">
            <p className="text-base md:text-lg text-muted-foreground text-left md:text-center mt-4 max-w-2xl">
              <span className="text-balance">
                Trackify was born from a simple idea: managing money shouldn’t feel
                complicated or overwhelming. Too many people struggle with budgets,
                scattered expenses, and the growing challenge of tracking both
                traditional and digital assets. We set out to change that.
              </span>
              <br />
              <br />
              <span className="mt-4 text-balance">
                What started as a small team of innovators and finance enthusiasts
                has grown into a company committed to building smart, intuitive,
                and secure tools for personal finance management.
              </span>
            </p>
          </Container>

          <Container delay={0.5} className="w-full max-w-4xl mx-auto">
            <div className="mt-10 w-full">
              <div className="flex flex-col items-center justify-center text-center h-80 w-full bg-primary rounded-xl lg:rounded-2xl p-6">
                <h3 className="text-3xl lg:text-4xl font-semibold tracking-tight text-black">
                  Simplifying everything you <br className="hidden lg:block" /> can
                  do with this product
                </h3>
                <Button
                  size="default"
                  className="mt-6 rounded-full bg-black text-white hover:bg-black/90"
                >
                  Our Integration
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </Wrapper>
    </div>
  )
}

