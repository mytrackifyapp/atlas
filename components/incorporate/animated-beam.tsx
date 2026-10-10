"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useCallback, useEffect, useId, useState, type RefObject } from "react"

type Anchor = "center" | "top" | "bottom" | "left" | "right"

type Pt = { x: number; y: number }

function anchorPoint(rect: DOMRect, container: DOMRect, anchor: Anchor): Pt {
  const x = rect.left - container.left
  const y = rect.top - container.top
  switch (anchor) {
    case "top":
      return { x: x + rect.width / 2, y }
    case "bottom":
      return { x: x + rect.width / 2, y: y + rect.height }
    case "left":
      return { x, y: y + rect.height / 2 }
    case "right":
      return { x: x + rect.width, y: y + rect.height / 2 }
    default:
      return { x: x + rect.width / 2, y: y + rect.height / 2 }
  }
}

function roundedElbow(a: Pt, b: Pt) {
  const r = 20
  const dx = b.x - a.x
  const dy = b.y - a.y
  if (Math.abs(dx) < 10) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
  if (Math.abs(dy) < 10) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`

  const sx = Math.sign(dx) || 1
  const sy = Math.sign(dy) || 1
  const x1 = b.x - sx * r
  const y2 = a.y + sy * r
  return `M ${a.x} ${a.y} H ${x1} Q ${b.x} ${a.y} ${b.x} ${y2} V ${b.y}`
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  fromAnchor = "center",
  toAnchor = "center",
  delay = 0,
  duration = 5,
}: {
  containerRef: RefObject<HTMLElement | null>
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  fromAnchor?: Anchor
  toAnchor?: Anchor
  delay?: number
  duration?: number
}) {
  const gradientId = useId().replace(/:/g, "")
  const filterId = `${gradientId}-glow`
  const reduceMotion = useReducedMotion()
  const [d, setD] = useState("")
  const [size, setSize] = useState({ width: 0, height: 0 })

  const measure = useCallback(() => {
    const container = containerRef.current
    const from = fromRef.current
    const to = toRef.current
    if (!container || !from || !to) return false
    const cr = container.getBoundingClientRect()
    const a = from.getBoundingClientRect()
    const b = to.getBoundingClientRect()
    if (cr.width < 8 || a.width < 8 || b.width < 8) return false
    setSize({ width: cr.width, height: cr.height })
    setD(roundedElbow(anchorPoint(a, cr, fromAnchor), anchorPoint(b, cr, toAnchor)))
    return true
  }, [containerRef, fromRef, toRef, fromAnchor, toAnchor])

  useEffect(() => {
    let cancelled = false
    let tries = 0

    const run = () => {
      if (cancelled) return
      if (measure()) return
      if (tries++ < 20) requestAnimationFrame(run)
    }

    run()
    const container = containerRef.current
    const ro = new ResizeObserver(() => measure())
    if (container) ro.observe(container)
    window.addEventListener("resize", measure)
    return () => {
      cancelled = true
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [measure, containerRef])

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] overflow-visible"
      width={size.width || "100%"}
      height={size.height || "100%"}
      viewBox={size.width ? `0 0 ${size.width} ${size.height}` : undefined}
      aria-hidden
    >
      <defs>
        <motion.linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: 0, y1: 0, x2: 40, y2: 40 }}
          animate={
            reduceMotion || !size.width
              ? undefined
              : {
                  x1: [0, size.width],
                  x2: [80, size.width + 80],
                  y1: [0, size.height],
                  y2: [80, size.height + 80],
                }
          }
          transition={{ duration: duration + 1.5, delay, repeat: Infinity, ease: "linear" }}
        >
          <stop offset="0%" stopColor="#c1ff72" stopOpacity="0" />
          <stop offset="50%" stopColor="#c1ff72" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </motion.linearGradient>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {d ? (
        <>
          <path d={d} fill="none" stroke="rgba(217,236,138,0.32)" strokeWidth="1.35" />
          <path
            d={d}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="2.15"
            strokeLinecap="round"
            filter={`url(#${filterId})`}
          />
          {reduceMotion ? null : (
            <motion.path
              d={d}
              fill="none"
              stroke="#ecfccb"
              strokeWidth="2.4"
              strokeLinecap="round"
              filter={`url(#${filterId})`}
              pathLength={100}
              strokeDasharray="18 82"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: [100, 0] }}
              transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
            />
          )}
        </>
      ) : null}
    </svg>
  )
}

function funnelPaths(card: DOMRect, hub: DOMRect, container: DOMRect, direction: "into" | "out") {
  const x = (rect: DOMRect, t: number) => rect.left - container.left + rect.width * t
  const y = (rect: DOMRect, edge: "top" | "bottom") =>
    rect.top - container.top + (edge === "bottom" ? rect.height : 0)

  if (direction === "into") {
    const y0 = y(card, "bottom")
    const y1 = y(hub, "top")
    const cy = y0 + (y1 - y0) * 0.55
    const starts = [0.18, 0.5, 0.82].map((t) => x(card, t))
    const ends = [0.22, 0.5, 0.78].map((t) => x(hub, t))
    return starts.map(
      (sx, i) => `M ${sx} ${y0} C ${sx} ${cy}, ${ends[i]} ${cy}, ${ends[i]} ${y1}`,
    )
  }

  const y0 = y(hub, "bottom")
  const y1 = y(card, "top")
  const cy = y0 + (y1 - y0) * 0.45
  const starts = [0.22, 0.5, 0.78].map((t) => x(hub, t))
  const ends = [0.18, 0.5, 0.82].map((t) => x(card, t))
  return starts.map(
    (sx, i) => `M ${sx} ${y0} C ${sx} ${cy}, ${ends[i]} ${cy}, ${ends[i]} ${y1}`,
  )
}

export function AnimatedFunnel({
  containerRef,
  cardRef,
  hubRef,
  direction,
  duration = 5,
}: {
  containerRef: RefObject<HTMLElement | null>
  cardRef: RefObject<HTMLElement | null>
  hubRef: RefObject<HTMLElement | null>
  direction: "into" | "out"
  duration?: number
}) {
  const gradientId = useId().replace(/:/g, "")
  const filterId = `${gradientId}-glow`
  const reduceMotion = useReducedMotion()
  const [paths, setPaths] = useState<string[]>([])
  const [size, setSize] = useState({ width: 0, height: 0 })

  const measure = useCallback(() => {
    const container = containerRef.current
    const card = cardRef.current
    const hub = hubRef.current
    if (!container || !card || !hub) return false
    const cr = container.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const hubRect = hub.getBoundingClientRect()
    if (cr.width < 8 || cardRect.width < 8 || hubRect.width < 8) return false
    setSize({ width: cr.width, height: cr.height })
    setPaths(funnelPaths(cardRect, hubRect, cr, direction))
    return true
  }, [containerRef, cardRef, hubRef, direction])

  useEffect(() => {
    let cancelled = false
    let tries = 0

    const run = () => {
      if (cancelled) return
      if (measure()) return
      if (tries++ < 20) requestAnimationFrame(run)
    }

    run()
    const container = containerRef.current
    const ro = new ResizeObserver(() => measure())
    if (container) ro.observe(container)
    if (cardRef.current) ro.observe(cardRef.current)
    if (hubRef.current) ro.observe(hubRef.current)
    window.addEventListener("resize", measure)
    return () => {
      cancelled = true
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [measure, containerRef, cardRef, hubRef])

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] overflow-visible"
      width={size.width || "100%"}
      height={size.height || "100%"}
      viewBox={size.width ? `0 0 ${size.width} ${size.height}` : undefined}
      aria-hidden
    >
      <defs>
        <motion.linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: 0, y1: 0, x2: 0, y2: 60 }}
          animate={
            reduceMotion || !size.height
              ? undefined
              : {
                  y1: [0, size.height],
                  y2: [80, size.height + 80],
                }
          }
          transition={{ duration: duration + 1.2, repeat: Infinity, ease: "linear" }}
        >
          <stop offset="0%" stopColor="#c1ff72" stopOpacity="0" />
          <stop offset="45%" stopColor="#c1ff72" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </motion.linearGradient>
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {paths.map((d, i) => (
        <g key={`${direction}-${i}`}>
          <path d={d} fill="none" stroke="rgba(217,236,138,0.3)" strokeWidth={i === 1 ? 1.5 : 1.2} />
          <path
            d={d}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={i === 1 ? 2.25 : 1.7}
            strokeLinecap="round"
            filter={`url(#${filterId})`}
          />
          {reduceMotion ? null : (
            <motion.path
              d={d}
              fill="none"
              stroke="#ecfccb"
              strokeWidth={i === 1 ? 2.5 : 2}
              strokeLinecap="round"
              filter={`url(#${filterId})`}
              pathLength={100}
              strokeDasharray="16 84"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: [100, 0] }}
              transition={{
                duration,
                delay: i * 0.28,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </g>
      ))}
    </svg>
  )
}
