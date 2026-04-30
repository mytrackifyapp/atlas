"use client"

import { useMemo, useState } from "react"
import Image from "next/image"

import Wrapper from "@/components/trackifyvc/global/wrapper"
import Container from "@/components/trackifyvc/global/container"
import {
  TRACKIFYVC_INTEGRATIONS,
  TRACKIFYVC_INTEGRATION_CATEGORIES,
  type TrackifyVcIntegrationCategory,
} from "@/lib/trackifyvc-constants"
import { cn } from "@/lib/utils"

export default function TrackifyVcIntegrationsSection() {
  const [activeCategory, setActiveCategory] = useState<TrackifyVcIntegrationCategory>("all")

  const filteredIntegrations = useMemo(
    () =>
      TRACKIFYVC_INTEGRATIONS.filter((integration) =>
        activeCategory === "all" ? true : integration.category === activeCategory
      ),
    [activeCategory]
  )

  return (
    <div className="w-full py-16 lg:py-24">
      <Wrapper>
        <Container>
          <div className="flex items-center gap-2 flex-wrap">
            {TRACKIFYVC_INTEGRATION_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer border",
                  activeCategory === category.value
                    ? "bg-primary text-black border-primary/30 shadow-[0_0_0_1px_rgba(0,0,0,0.1)]"
                    : "bg-[#0A0A0A] text-white border-white/10 hover:bg-white/5 hover:border-white/20"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </Container>

        <Container delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {filteredIntegrations.map((integration) => (
              <div
                key={`${integration.category}-${integration.name}`}
                className="flex flex-col p-6 rounded-2xl bg-[#0A0A0A] border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="size-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Image
                    src={integration.icon}
                    alt={integration.name}
                    width={24}
                    height={24}
                    className="size-6"
                  />
                </div>
                <h3 className="text-lg font-semibold mt-4">{integration.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {integration.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Wrapper>
    </div>
  )
}

