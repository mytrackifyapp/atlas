"use client"

import Image from "next/image"
import { CheckCircle2Icon } from "lucide-react"

import Wrapper from "@/components/trackifyvc/global/wrapper"
import Icons from "@/components/trackifyvc/global/icons"
import Container from "@/components/trackifyvc/global/container"
import { Button } from "@/components/ui/button"

export default function TrackifyVcIntegrationsHero() {
  return (
    <div className="relative z-0 w-full h-full">
      <div className="absolute -top-16 inset-x-0 -z-10 mx-auto w-3/4 h-32 lg:h-60 rounded-full blur-[5rem] bg-[radial-gradient(86.02%_172.05%_at_50%_-40%,rgba(18,139,135,1)_0%,rgba(5,5,5,0)_80%)]" />

      <Wrapper className="py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          <div className="flex flex-col w-full z-10">
            <Container>
              <div className="flex items-center gap-x-1 px-2 py-1.5 relative w-max rounded-full before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700 before:to-neutral-900 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/60">
                <Icons.stars className="size-5" />
                <span className="text-sm text-white">Trackify virtual Cards</span>
              </div>
            </Container>

            <Container delay={0.1}>
              <h2 className="text-balance !leading-[1.25] text-4xl md:text-6xl font-semibold tracking-tight mt-6 w-full">
                Get Virtual USD Card that actually works
                <br className="hidden lg:inline-block" /> in your name
              </h2>
            </Container>

            <Container delay={0.2}>
              <p className="text-base md:text-lg font-normal text-balance text-muted-foreground max-w-3xl mt-4">
                Use our Virtual Dollar Mastercard and Visa card to shop online,
                pay for services, or make international purchases.
              </p>
            </Container>

            <Container delay={0.3}>
              <div className="flex flex-col gap-2 mt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-4 text-primary" />
                  <span className="text-sm text-muted-foreground font-medium">
                    visa Supported
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-4 text-primary" />
                  <span className="text-sm text-muted-foreground font-medium">
                    Mastercard supported
                  </span>
                </div>
              </div>
            </Container>

            <Container delay={0.3}>
              <div className="mt-6">
                <Button size="md">Join Waitlist ✨</Button>
              </div>
            </Container>
          </div>

          <Container className="w-full z-30">
            <div className="w-4/5 mx-auto lg:ml-auto mt-10 lg:mt-0">
              <Image
                src="/images/integrations.svg"
                alt="Virtual cards integrations"
                priority
                width={2932}
                height={1664}
                loading="eager"
                className="w-full h-full"
              />
            </div>
          </Container>
        </div>
      </Wrapper>
    </div>
  )
}

