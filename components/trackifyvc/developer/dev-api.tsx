"use client"

import { useState } from "react"

import Container from "@/components/trackifyvc/global/container"
import Icons from "@/components/trackifyvc/global/icons"
import Wrapper from "@/components/trackifyvc/global/wrapper"
import { Marquee } from "@/components/ui/marquee"
import { TRACKIFYVC_MARQUEE_ITEMS } from "@/lib/trackifyvc-constants"

export default function DevApi() {
  const [_isYearly, _setIsYearly] = useState(false)

  return (
    <div className="relative z-0 w-full h-full">
      <div className="absolute -top-16 inset-x-0 -z-10 mx-auto w-3/4 h-32 lg:h-60 rounded-full blur-[5rem] bg-[radial-gradient(86.02%_172.05%_at_50%_-40%,rgba(18,139,135,1)_0%,rgba(5,5,5,0)_80%)]"></div>

      <Wrapper className="py-20">
        <div className="flex flex-col items-center justify-center w-full z-10">
          <Container>
            <div className="flex items-center justify-center gap-x-1 px-2 py-1.5 relative w-max mx-auto rounded-full before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700 before:to-neutral-900 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/60">
              <Icons.stars className="size-5" />
              <span className="text-sm text-white">Trackify Developers API</span>
            </div>
          </Container>

          <Container delay={0.1}>
            <h2 className="text-balance !leading-[1.25] text-center text-4xl md:text-6xl font-semibold tracking-tight mt-6 w-full">
              Powering the Future of <br className="hidden lg:inline-block" />{" "}
              Personal Finance
            </h2>
          </Container>

          <Container delay={0.2}>
            <p className="text-base md:text-lg font-normal text-center text-balance text-muted-foreground max-w-3xl mx-auto mt-4">
              The Trackify Developer API will allow fintechs, startups, and
              builders to integrate AI-driven financial insights, expense tracking,
              budgeting, and Web3 capabilities directly into their apps and
              platforms.
            </p>
          </Container>

          <Container delay={0.3}>
            <div className="mt-6 flex justify-center lg:justify-start w-full">
              <div className="w-full rounded-2xl border-[1.5px] border-border transition-all duration-300 cursor-pointer hover:border-primary/50">
                <div className="flex items-center justify-between p-6">
                  <h3 className="text-lg font-medium">
                    <b>Status:</b> The API is currently in development and not yet
                    available to the public
                  </h3>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </Wrapper>

      <div className="w-full bg-primary py-6 overflow-hidden">
        <Marquee className="[--duration:30s] [--gap:2rem]" pauseOnHover>
          <div className="flex items-center">
            {TRACKIFYVC_MARQUEE_ITEMS.map((item, index) => (
              <div key={index} className="flex items-center gap-x-4">
                <span className="text-base font-medium text-primary-foreground hover:opacity-70 transition-opacity">
                  {item}
                </span>
                <Icons.stars className="size-5 text-black mr-4" />
              </div>
            ))}
          </div>
        </Marquee>
      </div>
    </div>
  )
}

