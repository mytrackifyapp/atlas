"use client"

import Link from "next/link"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"
import { getAgentMarketingContent, getAgentPagePath } from "@/lib/ai-agents-marketing"

const SHOWCASE_AGENTS = AI_AGENTS_CATALOG.filter((a) => a.imageSrc)

function AgentCard({ agent }: { agent: (typeof SHOWCASE_AGENTS)[number] }) {
  const content = getAgentMarketingContent(agent)

  return (
    <Link href={getAgentPagePath(agent.id)} className="group flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-900 transition-transform group-hover:scale-[1.02]">
        <img
          src={agent.imageSrc!}
          alt={content.displayName}
          className="h-full w-full object-cover"
        />
      </div>
      <h3 className="mt-4 text-lg font-bold text-white transition-colors group-hover:text-[#4483f2]">
        {content.displayName}
      </h3>
      <p className="mt-1 text-sm font-semibold text-white">{content.roleTitle}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/65">{agent.description}</p>
    </Link>
  )
}

export function AiAgentsShowcase() {
  return (
    <section className="overflow-hidden bg-black py-16 sm:py-20">
      <div className="relative mx-auto max-w-[1400px] px-14 sm:px-20">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-5 md:-ml-6">
            {SHOWCASE_AGENTS.map((agent) => (
              <CarouselItem
                key={agent.id}
                className="basis-[72%] pl-5 sm:basis-[48%] md:basis-[34%] lg:basis-[28%] xl:basis-[24%] md:pl-6"
              >
                <AgentCard agent={agent} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-0 top-[36%] z-10 h-11 w-11 -translate-y-1/2 rounded-full border-neutral-600 bg-neutral-800 text-white shadow-lg hover:bg-neutral-700 hover:text-white disabled:opacity-30" />
          <CarouselNext className="right-0 top-[36%] z-10 h-11 w-11 -translate-y-1/2 rounded-full border-neutral-600 bg-neutral-800 text-white shadow-lg hover:bg-neutral-700 hover:text-white disabled:opacity-30" />
        </Carousel>
      </div>
    </section>
  )
}
