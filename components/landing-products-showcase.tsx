"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef } from "react"
import {
  Briefcase,
  Building2,
  Landmark,
  Rocket,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const PRODUCTS: {
  title: string
  description: string
  href: string
  icon: LucideIcon
}[] = [
  {
    title: "Build your company",
    description: "Run finance, fundraising, and ops from one founder workspace.",
    href: "/founder",
    icon: Rocket,
  },
  {
    title: "Invest with clarity",
    description: "Portfolio, deals, and insights unified for investment teams.",
    href: "/dashboard",
    icon: Briefcase,
  },
  {
    title: "Own your runway",
    description: "Track cash, budgets, and runway with fund grade clarity.",
    href: "/founder/finance",
    icon: Wallet,
  },
  {
    title: "See every stake",
    description: "Every company and investment in one connected view.",
    href: "/portfolio",
    icon: Building2,
  },
  {
    title: "Hire an AI team",
    description: "Specialists for finance, legal, sales, and operations.",
    href: "/ai-agents",
    icon: Sparkles,
  },
  {
    title: "Raise capital",
    description: "Pipeline, docs, and receive funds through Trackify rails.",
    href: "/founder/fundraising",
    icon: Landmark,
  },
]

const LOOP_ITEMS = [...PRODUCTS, ...PRODUCTS]

function ProductCard({
  product,
  onDragIntent,
}: {
  product: (typeof PRODUCTS)[number]
  onDragIntent?: () => boolean
}) {
  const Icon = product.icon

  return (
    <Link
      href={product.href}
      draggable={false}
      onClick={(event) => {
        if (onDragIntent?.()) {
          event.preventDefault()
        }
      }}
      className={cn(
        "group relative block h-[340px] w-[240px] shrink-0 select-none overflow-hidden rounded-[1.75rem]",
        "border border-white/20 sm:h-[400px] sm:w-[280px] lg:h-[420px] lg:w-[300px]",
        "bg-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.22)]",
        "backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500",
        "hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.09]",
        "hover:shadow-[0_16px_48px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.28)]",
      )}
    >
      {/* Liquid specular highlight */}
      <div
        className="pointer-events-none absolute -left-1/4 -top-1/3 h-[70%] w-[150%] rotate-[-8deg] bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.04)_35%,transparent_60%)] opacity-80"
        aria-hidden
      />
      {/* Soft contained glass pool (no external bleed) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(255,255,255,0.06),transparent)]"
        aria-hidden
      />
      {/* Frosted grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />
      {/* Glass rim */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/15"
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-7 text-center sm:px-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center text-white sm:mb-7 sm:h-14 sm:w-14">
          <Icon className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={1.5} aria-hidden />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
          {product.title}.
        </h3>
        <p className="mt-3 max-w-[18ch] text-sm leading-relaxed text-white/70 sm:mt-4 sm:text-[0.9375rem] sm:leading-relaxed">
          {product.description}
        </p>
      </div>
    </Link>
  )
}

function SwipeableMarquee() {
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
  })

  const wasDragged = useCallback(() => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false
      return true
    }
    return false
  }, [])

  const normalizeScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const loopPoint = track.scrollWidth / 2
    if (loopPoint > 0 && track.scrollLeft >= loopPoint) {
      track.scrollLeft -= loopPoint
    }
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let frame = 0
    const speed = 0.6

    const step = () => {
      if (!pausedRef.current) {
        track.scrollLeft += speed
        const loopPoint = track.scrollWidth / 2
        if (loopPoint > 0 && track.scrollLeft >= loopPoint) {
          track.scrollLeft -= loopPoint
        }
      }
      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [])

  const endDrag = () => {
    dragRef.current.active = false
    pausedRef.current = false
    normalizeScroll()
    if (trackRef.current) {
      trackRef.current.style.cursor = "grab"
    }
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track || event.pointerType === "touch") return

    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: track.scrollLeft,
    }
    pausedRef.current = true
    track.setPointerCapture(event.pointerId)
    track.style.cursor = "grabbing"
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    const drag = dragRef.current
    if (!track || !drag.active) return

    const delta = event.clientX - drag.startX
    if (Math.abs(delta) > 6) drag.moved = true
    track.scrollLeft = drag.scrollLeft - delta
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track || !dragRef.current.active) return
    track.releasePointerCapture(event.pointerId)
    endDrag()
  }

  return (
    <div
      ref={trackRef}
      className={cn(
        "flex cursor-grab gap-4 overflow-x-auto pb-2 pt-2 sm:gap-5",
        "touch-pan-x overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => {
        pausedRef.current = true
      }}
      onMouseLeave={() => {
        if (!dragRef.current.active) pausedRef.current = false
        endDrag()
      }}
      onTouchStart={() => {
        pausedRef.current = true
        dragRef.current.moved = false
      }}
      onTouchMove={() => {
        dragRef.current.moved = true
      }}
      onTouchEnd={() => {
        pausedRef.current = false
        normalizeScroll()
      }}
    >
      {LOOP_ITEMS.map((product, index) => (
        <ProductCard
          key={`${product.href}-${index}`}
          product={product}
          onDragIntent={wasDragged}
        />
      ))}
    </div>
  )
}

export function LandingProductsShowcase() {
  return (
    <section
      id="products"
      className="scroll-mt-20 overflow-hidden bg-black pb-8 pt-6 sm:pb-10 sm:pt-8"
      aria-label="Products and services"
    >
      <SwipeableMarquee />
    </section>
  )
}
