"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const STAGES = [
  {
    title: "Pre-Seed & Seed",
    description: "Early-stage validation and market entry strategies",
    href: "/stages/pre-seed-seed",
    image: "/minimalist-line-drawing-of-person-with-telescope-l.jpg",
    imageAlt: "Pre-seed Stage",
    gradient: "from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20",
  },
  {
    title: "Series A",
    description: "Scaling operations and product-market fit optimization",
    href: "/stages/series-a",
    image: "/minimalist-line-drawing-of-sailboat-with-compass--.jpg",
    imageAlt: "Series A Stage",
    gradient: "from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20",
  },
  {
    title: "Growth Stage (B-D)",
    description: "Rapid expansion and market dominance strategies",
    href: "/stages/growth",
    image: "/minimalist-line-drawing-of-person-writing-on-money.jpg",
    imageAlt: "Growth Stage",
    gradient: "from-lime-50 to-lime-100 dark:from-lime-950/20 dark:to-lime-900/20",
  },
  {
    title: "Late Stage & Exit",
    description: "IPO preparation and acquisition opportunities",
    href: "/stages/late-stage-exit",
    image: "/minimalist-line-drawing-of-stairs-climbing-upward-.jpg",
    imageAlt: "Late Stage & Exit",
    gradient: "from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20",
  },
] as const

function StageCard({ stage }: { stage: (typeof STAGES)[number] }) {
  return (
    <Card
      className={`group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-gradient-to-br ${stage.gradient}`}
    >
      <div className="aspect-square p-8 flex items-center justify-center">
        <img
          src={stage.image}
          alt={stage.imageAlt}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-background/95 via-background/90 to-transparent pt-20">
        <h3 className="text-xl font-semibold mb-2">{stage.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{stage.description}</p>
        <Button
          size="sm"
          variant="ghost"
          className="group-hover:bg-primary/10 group-hover:text-primary transition-colors"
          asChild
        >
          <Link href={stage.href}>
            Explore
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  )
}

export function InvestmentStageCards() {
  return (
    <>
      {/* Mobile: Carousel */}
      <div className="md:hidden relative px-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            dragFree: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {STAGES.map((stage) => (
              <CarouselItem key={stage.href} className="pl-4 basis-[85%] sm:basis-[75%]">
                <StageCard stage={stage} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 h-9 w-9 rounded-full border-border bg-background/80 shadow-md disabled:opacity-50" />
          <CarouselNext className="right-0 h-9 w-9 rounded-full border-border bg-background/80 shadow-md disabled:opacity-50" />
        </Carousel>
      </div>

      {/* Desktop: Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAGES.map((stage) => (
          <StageCard key={stage.href} stage={stage} />
        ))}
      </div>
    </>
  )
}
