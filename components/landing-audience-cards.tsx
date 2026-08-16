import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

const AUDIENCES = [
  {
    href: "/solutions/investors",
    title: "For Investors",
    image: "/images/img1.PNG",
    alt: "Investor dashboard — portfolio analytics, deal flow, and market intelligence",
  },
  {
    href: "/solutions/founders",
    title: "For Founders",
    image: "/images/img2.PNG",
    alt: "Founder dashboard — fundraising tracker, investor pipeline, and metrics",
  },
]

export function LandingAudienceCards({ className }: { className?: string }) {
  return (
    <div
      id="audiences"
      className={cn(
        "w-full max-w-none rounded-[1.35rem] border border-white/25 bg-white/15 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:max-w-[460px] sm:rounded-[2rem] sm:p-3.5",
        className,
      )}
    >
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {AUDIENCES.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative block aspect-[3/4] overflow-hidden rounded-[1.1rem] shadow-[0_8px_24px_rgba(0,0,0,0.2)] sm:aspect-[4/5] sm:rounded-3xl"
          >
            <img
              src={card.image}
              alt={card.alt}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
              aria-hidden
            />
            <h2 className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pr-9 text-[0.8rem] font-semibold leading-tight tracking-tight text-white sm:px-4 sm:pb-4 sm:pr-12 sm:text-lg">
              {card.title}
            </h2>
            <span
              className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-950 shadow-sm transition-transform duration-300 group-hover:scale-105 sm:bottom-4 sm:right-4 sm:h-9 sm:w-9"
              aria-hidden
            >
              <ArrowUpRight className="h-3.5 w-3.5 sm:h-[1.125rem] sm:w-[1.125rem]" strokeWidth={2.25} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
