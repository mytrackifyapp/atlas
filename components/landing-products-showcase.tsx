"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const PRODUCTS = [
  {
    title: "Founder OS",
    description: "Run your startup from one place.",
    href: "/founder",
    image: "/bg-03.jpg",
    imagePosition: "object-center",
  },
  {
    title: "Investor OS",
    description: "Portfolio, deals, and insights unified.",
    href: "/dashboard",
    image: "/bg-01.jpg",
    imagePosition: "object-center",
  },
  {
    title: "Finance management",
    description: "Track cash, budgets, and runway.",
    href: "/founder/finance",
    image: "/bg-02.jpeg",
    imagePosition: "object-top",
  },
  {
    title: "Manage startups & investments",
    description: "See every company in your portfolio.",
    href: "/portfolio",
    image: "/bg-01.jpg",
    imagePosition: "object-top",
  },
  {
    title: "AI employees",
    description: "Specialists for finance, legal, and ops.",
    href: "/ai-agents",
    image: "/bg-04.jpg",
    imagePosition: "object-top",
  },
  {
    title: "Raise capital",
    description: "Pipeline, docs, and investor updates.",
    href: "/founder/fundraising",
    image: "/bg-01.jpg",
    imagePosition: "object-center",
  },
] as const

const LOOP_ITEMS = [...PRODUCTS, ...PRODUCTS]

function ProductCard({
  product,
  onDragIntent,
}: {
  product: (typeof PRODUCTS)[number]
  onDragIntent?: () => boolean
}) {
  return (
    <Link
      href={product.href}
      draggable={false}
      onClick={(event) => {
        if (onDragIntent?.()) {
          event.preventDefault()
        }
      }}
      className="group relative block h-[340px] w-[240px] shrink-0 overflow-hidden rounded-2xl select-none sm:h-[420px] sm:w-[290px] lg:h-[440px] lg:w-[320px]"
    >
      <img
        src={product.image}
        alt=""
        draggable={false}
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
          product.imagePosition,
        )}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-1 p-4 sm:space-y-1.5 sm:p-5">
        <p className="max-w-[95%] text-sm font-medium leading-snug text-white sm:text-base">
          {product.title}
        </p>
        <p className="max-w-[95%] text-xs leading-relaxed text-white/70 sm:text-[0.8125rem]">
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
        "flex cursor-grab gap-3.5 overflow-x-auto pb-0 pt-2 sm:gap-4",
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
      className="scroll-mt-20 -mt-2 overflow-hidden bg-white pb-3 pt-5 sm:-mt-3 sm:pb-4 sm:pt-6"
      aria-label="Products and services"
    >
      <SwipeableMarquee />
    </section>
  )
}
