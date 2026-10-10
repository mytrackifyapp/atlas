"use client"

import { forwardRef, useRef, type ComponentType } from "react"
import {
  Building2,
  Files,
  IdCard,
  Landmark,
  MapPin,
  ShieldPlus,
} from "lucide-react"

import { AnimatedBeam, AnimatedFunnel } from "@/components/incorporate/animated-beam"

const HUB_CARDS = [
  {
    id: "formation",
    title: "Formation",
    body: "LLCs or C-Corps. Palm files from your Trackify dashboard.",
    icon: Building2,
  },
  {
    id: "ein",
    title: "EIN",
    body: "Handled for U.S. and non-U.S. founders. No U.S. address required.",
    icon: IdCard,
  },
  {
    id: "agent",
    title: "Registered agent",
    body: "Included with formation. Coverage in all 50 states.",
    icon: ShieldPlus,
  },
  {
    id: "bank",
    title: "U.S. bank account",
    body: "A path to U.S. banking after the entity exists — then operate on Trackify.",
    icon: Landmark,
  },
  {
    id: "address",
    title: "U.S. address",
    body: "A physical address and mailroom for official notices.",
    icon: MapPin,
  },
  {
    id: "operate",
    title: "Operate on Trackify",
    body: "Finance, fundraising, and the data room once the entity exists.",
    icon: Files,
  },
] as const satisfies ReadonlyArray<{
  id: string
  title: string
  body: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
}>

const TOP_CARDS = HUB_CARDS.slice(0, 3)
const BOTTOM_CARDS = HUB_CARDS.slice(3)

const HubCard = forwardRef<HTMLLIElement, { card: (typeof HUB_CARDS)[number] }>(
  function HubCard({ card }, ref) {
    const Icon = card.icon

    return (
      <li
        ref={ref}
        className="relative z-10 flex min-h-[17.5rem] flex-col rounded-[1.85rem] border border-white/[0.07] bg-[#141414] px-7 pb-7 pt-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:min-h-[19rem] sm:px-8 sm:pb-8 sm:pt-8 lg:min-h-[22rem]"
      >
        <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{card.title}</h3>
        <p className="mt-3 max-w-[20rem] text-[15px] leading-relaxed text-white/45 sm:text-base">
          {card.body}
        </p>
        <div className="mt-auto flex justify-center pt-10">
          <Icon className="h-12 w-12 text-white/50 sm:h-14 sm:w-14" strokeWidth={1.25} aria-hidden />
        </div>
      </li>
    )
  },
)

const HubMark = forwardRef<HTMLDivElement>(function HubMark(_, ref) {
  return (
    <div
      ref={ref}
      className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-[#161616] px-6 py-3.5 shadow-[0_0_48px_rgba(193,255,114,0.22)]"
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_40%,rgba(193,255,114,0.22),transparent_58%),radial-gradient(circle_at_80%_60%,rgba(125,211,252,0.16),transparent_55%)]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/trackify-logo.png"
        alt=""
        className="relative h-9 w-9 rounded-full object-cover"
      />
      <span className="relative text-[15px] font-semibold tracking-tight text-white">Trackify</span>
    </div>
  )
})

const DESKTOP_BEAMS = [
  { fromAnchor: "left", toAnchor: "bottom" },
  { fromAnchor: "top", toAnchor: "bottom" },
  { fromAnchor: "right", toAnchor: "bottom" },
  { fromAnchor: "left", toAnchor: "top" },
  { fromAnchor: "bottom", toAnchor: "top" },
  { fromAnchor: "right", toAnchor: "top" },
] as const

export function IncorporateHub() {
  const desktopRef = useRef<HTMLDivElement>(null)
  const hubRef = useRef<HTMLDivElement>(null)
  const card0 = useRef<HTMLLIElement>(null)
  const card1 = useRef<HTMLLIElement>(null)
  const card2 = useRef<HTMLLIElement>(null)
  const card3 = useRef<HTMLLIElement>(null)
  const card4 = useRef<HTMLLIElement>(null)
  const card5 = useRef<HTMLLIElement>(null)
  const cardRefs = [card0, card1, card2, card3, card4, card5]

  const mobileRef = useRef<HTMLDivElement>(null)
  const mobileHubRef = useRef<HTMLDivElement>(null)
  const mobileTopRef = useRef<HTMLLIElement>(null)
  const mobileBottomRef = useRef<HTMLLIElement>(null)

  return (
    <section className="bg-black px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-28">
      <div className="relative mx-auto max-w-7xl">
        <div ref={mobileRef} className="relative lg:hidden">
          <ul className="flex flex-col gap-3">
            {TOP_CARDS.map((card, i) => (
              <HubCard
                key={card.id}
                ref={i === TOP_CARDS.length - 1 ? mobileTopRef : undefined}
                card={card}
              />
            ))}
          </ul>
          <div className="h-[4.75rem]" aria-hidden />
          <div className="relative z-20 flex justify-center">
            <HubMark ref={mobileHubRef} />
          </div>
          <div className="h-[4.75rem]" aria-hidden />
          <ul className="flex flex-col gap-3">
            {BOTTOM_CARDS.map((card, i) => (
              <HubCard
                key={`m-${card.id}`}
                ref={i === 0 ? mobileBottomRef : undefined}
                card={card}
              />
            ))}
          </ul>
          <AnimatedFunnel
            containerRef={mobileRef}
            cardRef={mobileTopRef}
            hubRef={mobileHubRef}
            direction="into"
          />
          <AnimatedFunnel
            containerRef={mobileRef}
            cardRef={mobileBottomRef}
            hubRef={mobileHubRef}
            direction="out"
            duration={5.4}
          />
        </div>

        <div ref={desktopRef} className="relative hidden lg:block">
          <ul className="grid grid-cols-3 gap-x-6 gap-y-[9.5rem]">
            {HUB_CARDS.map((card, i) => (
              <HubCard key={card.id} ref={cardRefs[i]} card={card} />
            ))}
          </ul>
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="pointer-events-auto">
              <HubMark ref={hubRef} />
            </div>
          </div>
          {DESKTOP_BEAMS.map((beam, i) => (
            <AnimatedBeam
              key={HUB_CARDS[i].id}
              containerRef={desktopRef}
              fromRef={hubRef}
              toRef={cardRefs[i]}
              fromAnchor={beam.fromAnchor}
              toAnchor={beam.toAnchor}
              delay={i * 0.45}
              duration={5.2}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
