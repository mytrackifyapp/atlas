"use client"

import Image from "next/image"
import { Marquee } from "@/components/ui/marquee"
import { cn } from "@/lib/utils"

type Testimonial = {
  name: string
  role: string
  company: string
  image: string
  content: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Amina K.",
    role: "Founder",
    company: "FinTech",
    image: "/images/img5.jpg",
    content: "Atlas helped us tighten our raise, track investor follow-ups, and keep the data room organized.",
  },
  {
    name: "David O.",
    role: "Partner",
    company: "VC Fund",
    image: "/images/img6.jpg",
    content: "The deal flow pipeline and portfolio view are exactly what our team needed to move faster.",
  },
  {
    name: "Nana S.",
    role: "Principal",
    company: "Angel Syndicate",
    image: "/images/img5.jpg",
    content: "The ecosystem mapping saves hours every week. We can spot the right founders and intros quickly.",
  },
  {
    name: "Kofi A.",
    role: "Co-founder",
    company: "HealthTech",
    image: "/images/img6.jpg",
    content: "We replaced messy spreadsheets with one workspace. Updates, docs, metrics — all in one place.",
  },
]

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="flex flex-col bg-card/80 border border-border/60 rounded-xl p-5 w-[320px] sm:w-[360px]">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full overflow-hidden border border-border/60 bg-muted shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{item.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {item.role} <span className="text-primary">@{item.company}</span>
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
        &quot;{item.content}&quot;
      </p>
    </div>
  )
}

export function TrackifyVcTestimonialsMarquee({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <Marquee pauseOnHover className="[--duration:70s]">
        {TESTIMONIALS.map((t) => (
          <TestimonialCard key={`${t.name}-${t.company}`} item={t} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 sm:w-1/4 bg-gradient-to-r from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 sm:w-1/4 bg-gradient-to-l from-background" />
    </div>
  )
}

