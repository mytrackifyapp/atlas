"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { LayoutGrid, type LucideIcon } from "lucide-react"

import "./circular-nav.css"

export type CircularNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type CircularNavMoreItem = {
  label: string
  href?: string
  icon?: LucideIcon
  onClick?: () => void
}

function playSound(src: string) {
  const audio = new Audio(src)
  audio.volume = 0.35
  void audio.play().catch(() => {})
}

function segmentGeometry(index: number, total: number, size: number) {
  const center = size / 2
  const innerRadius = size * 0.08
  const outerRadius = size * 0.42
  const contentRadius = size * 0.28
  const sweep = 360 / total
  const start = sweep * index + 0.19
  const end = sweep * index + sweep - 0.19
  const mid = sweep * index + sweep / 2

  const point = (radius: number, degrees: number) => {
    const radians = ((degrees - 90) * Math.PI) / 180
    return [center + radius * Math.cos(radians), center + radius * Math.sin(radians)] as const
  }

  const [innerStartX, innerStartY] = point(innerRadius, start)
  const [outerStartX, outerStartY] = point(outerRadius, start)
  const [innerEndX, innerEndY] = point(innerRadius, end)
  const [outerEndX, outerEndY] = point(outerRadius, end)
  const [contentX, contentY] = point(contentRadius, mid)
  const largeArc = end - start > 180 ? 1 : 0

  const path = [
    `M ${innerStartX} ${innerStartY}`,
    `L ${outerStartX} ${outerStartY}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}`,
    `L ${innerEndX} ${innerEndY}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}`,
    "Z",
  ].join(" ")

  return { path, contentX, contentY }
}

function menuSize() {
  if (typeof window === "undefined") return 360
  const max = Math.min(window.innerWidth * 0.92, window.innerHeight * 0.72)
  return Math.max(280, Math.min(max, 560))
}

export function CircularNavOverlay({
  open,
  onClose,
  items,
  moreItems = [],
  headerEnd,
}: {
  open: boolean
  onClose: () => void
  items: CircularNavItem[]
  moreItems?: CircularNavMoreItem[]
  headerEnd?: ReactNode
}) {
  const reduceMotion = useReducedMotion()
  const [size, setSize] = useState(360)
  const [hotIndex, setHotIndex] = useState<number | null>(null)
  const [order, setOrder] = useState<number[]>([])
  const [moreOpen, setMoreOpen] = useState(false)
  const [shown, setShown] = useState(false)
  const [mounted, setMounted] = useState(false)
  const hotRef = useRef<number | null>(null)
  const onCloseRef = useRef(onClose)
  const itemsRef = useRef(items)
  onCloseRef.current = onClose
  itemsRef.current = items

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) setShown(true)
  }, [open])

  useEffect(() => {
    if (!open) return
    setMoreOpen(false)
    setOrder(itemsRef.current.map((_, index) => index).sort(() => Math.random() - 0.5))
    const measure = () => setSize(menuSize())
    measure()
    playSound("/nav/menu-open.mp3")
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("resize", measure)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("resize", measure)
      window.removeEventListener("keydown", onKey)
      hotRef.current = null
      setHotIndex(null)
    }
  }, [open])

  const close = () => {
    playSound("/nav/menu-close.mp3")
    onClose()
  }

  if (!mounted || !shown) return null

  return createPortal(
        <div className="fixed inset-0 z-[70]">
          <div
            className="circular-nav-bg absolute inset-0"
            style={{ background: "rgba(255, 255, 255, 0.82)", backdropFilter: "blur(48px)", WebkitBackdropFilter: "blur(48px)" }}
          />
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.25 }}
            onAnimationComplete={() => {
              if (!open) setShown(false)
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5">
            <button
              type="button"
              onClick={close}
              className="relative flex h-11 w-11 items-center justify-center"
              aria-label="Close menu"
            >
              <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-neutral-950" />
              <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-neutral-950" />
            </button>
            <div className="flex items-center gap-4">{headerEnd}</div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            {moreOpen ? (
              <div className="pointer-events-auto flex max-h-[72vh] w-[min(100%,22rem)] flex-col items-center rounded-[28px] bg-white px-6 py-2 shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
                <ul className="w-full overflow-y-auto">
                  {moreItems.map((item) => {
                    const Icon = item.icon
                    const row = (
                      <>
                        {Icon ? <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} /> : null}
                        <span>{item.label}</span>
                      </>
                    )
                    return (
                      <li key={item.label} className="border-b border-black/10">
                        {item.href ? (
                          <Link href={item.href} onClick={close} className="flex items-center gap-3 py-3.5 text-base text-neutral-950">
                            {row}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              item.onClick?.()
                              close()
                            }}
                            className="flex w-full items-center gap-3 py-3.5 text-left text-base text-neutral-950"
                          >
                            {row}
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="mb-4 mt-6 flex h-[100px] w-[100px] shrink-0 flex-col items-center justify-center rounded-full bg-neutral-950 text-white"
                  aria-label="Back to menu"
                >
                  <LayoutGrid className="h-7 w-7" strokeWidth={1.75} />
                  <span className="mt-1 text-[11px] font-medium">Back</span>
                </button>
              </div>
            ) : (
            <div className="pointer-events-auto relative" style={{ width: size, height: size }}>
              {items.map((item, index) => {
                const geometry = segmentGeometry(index, items.length, size)
                const Icon = item.icon
                const delay = order.indexOf(index) * 0.05
                return (
                  <motion.div
                    key={item.href + item.label}
                    className="pointer-events-none absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: reduceMotion ? 1 : [0, 1, 0.2, 1] }}
                    transition={{ duration: reduceMotion ? 0.01 : 0.35, delay }}
                  >
                    <Link
                      href={item.href}
                      onClick={close}
                      onPointerEnter={() => {
                        if (hotRef.current === index) return
                        hotRef.current = index
                        setHotIndex(index)
                        playSound("/nav/menu-select.mp3")
                      }}
                      onPointerLeave={() => {
                        if (hotRef.current !== index) return
                        hotRef.current = null
                        setHotIndex(null)
                      }}
                      className={`circular-nav-segment pointer-events-auto ${hotIndex === index ? "is-hot" : ""}`}
                      style={{ clipPath: `path('${geometry.path}')` }}
                    >
                      <span
                        className="circular-nav-copy absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center text-white"
                        style={{ left: geometry.contentX, top: geometry.contentY }}
                      >
                        <Icon className="mb-1.5 h-5 w-5 sm:h-8 sm:w-8" strokeWidth={1.75} />
                        <span className="text-[13px] font-medium leading-none sm:text-[15px]">{item.label}</span>
                      </span>
                    </Link>
                  </motion.div>
                )
              })}

              {moreItems.length ? (
                <motion.button
                  type="button"
                  onClick={() => setMoreOpen(true)}
                  className="absolute z-20 flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full bg-white text-black"
                  style={{ left: "50%", top: "50%", marginLeft: -50, marginTop: -50 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={reduceMotion ? { duration: 0.01 } : { type: "spring", delay: 0.15, bounce: 0.35 }}
                  aria-label="More"
                >
                  <LayoutGrid className="h-7 w-7" strokeWidth={1.75} />
                  <span className="mt-1 text-[11px] font-medium">More</span>
                </motion.button>
              ) : null}
            </div>
            )}
          </div>
        </motion.div>
        </div>,
    document.body,
  )
}

export function CircularNavDome({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="circular-nav-dome lg:hidden" onClick={onClick} aria-label="Open menu">
      <span className="circular-nav-dome-bar" />
      <span className="circular-nav-dome-bar" />
    </button>
  )
}
