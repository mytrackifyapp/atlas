"use client"

import Image from "next/image"

import Container from "@/components/trackifyvc/global/container"
import Icons from "@/components/trackifyvc/global/icons"
import Wrapper from "@/components/trackifyvc/global/wrapper"

export default function OurStory() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-16 lg:py-24">
      <Wrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-start justify-start md:items-center md:justify-center">
            <Container>
              <div className="flex items-center justify-center gap-x-1 px-2 py-1.5 relative w-max rounded-full before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700 before:to-neutral-900 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/60">
                <Icons.stars className="size-5" />
                <span className="text-sm text-white">Our Story</span>
              </div>
            </Container>
            <Container delay={0.1} className="flex grow">
              <h2 className="text-3xl md:text-4xl font-semibold text-left mt-4">
                Experts in Fintech Innovation and Customer Success
              </h2>
            </Container>
            <Container delay={0.3} className="mt-auto">
              <div className="flex items-center gap-4">
                <div className="size-24">
                  <Image
                    src="/icons/heart.svg"
                    alt="Heart"
                    width={1024}
                    height={1024}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-base md:text-lg text-muted-foreground text-left mt-2 max-w-2xl">
                  At Trackify Finance, we are a passionate team of builders,
                  innovators, and finance enthusiasts committed to transforming the
                  way people manage money.
                </p>
              </div>
            </Container>
          </div>

          <div className="flex flex-col gap-8">
            <Container className="flex items-start gap-6">
              <div className="flex flex-col items-center min-w-[40px]">
                <span className="text-2xl font-semibold text-muted-foreground/80 font-heading">
                  01
                </span>
                <span className="w-px h-16 bg-neutral-700 mt-1"></span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl lg:text-2xl font-semibold font-heading">
                  Years of collective & focused fintech / AI research
                </h4>
                <div className="mt-2 text-base text-neutral-400">
                  Our journey began with a simple question: How can technology help
                  people take control of their finances with less stress? Since
                  then, we’ve been continuously researching, testing, and improving
                  solutions that make financial management effortless.
                </div>
              </div>
            </Container>
            <Container delay={0.1} className="flex items-start gap-6">
              <div className="flex flex-col items-center min-w-[40px]">
                <span className="text-2xl font-semibold text-muted-foreground/80 font-heading">
                  02
                </span>
                <span className="w-px h-16 bg-neutral-700 mt-1"></span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl lg:text-2xl font-semibold font-heading">
                  25 Years of evolving experience
                </h4>
                <div className="mt-2 text-base text-neutral-400">
                  Our team brings together years of experience in software
                  development, design, and customer support. But more importantly,
                  we stay close to our users — learning from their needs and
                  evolving our platform to deliver real value every day.
                </div>
              </div>
            </Container>
            <Container delay={0.2} className="flex items-start gap-6">
              <div className="flex flex-col items-center min-w-[40px]">
                <span className="text-2xl font-semibold text-muted-foreground/80 font-heading">
                  03
                </span>
                <span className="w-px h-16 bg-neutral-700 mt-1"></span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl lg:text-2xl font-semibold font-heading">
                  Growing team day by day
                </h4>
                <div className="mt-2 text-base text-neutral-400">
                  Trackify is growing fast - not just in numbers, but in ideas,
                  skills, and ambition. Every new team member helps us push further
                  toward our mission: building the most user-friendly and
                  intelligent personal finance platform for the modern world.
                </div>
              </div>
            </Container>
          </div>
        </div>
      </Wrapper>
    </div>
  )
}

