"use client"

import { ThinkingOrb, type OrbSize, type OrbState, type OrbTheme } from "thinking-orbs"

import { cn } from "@/lib/utils"

export type FinnaOrbProps = {
  thinking?: boolean
  size?: OrbSize
  theme?: OrbTheme
  state?: OrbState
  className?: string
  label?: string
}

export function FinnaOrb({
  thinking: _thinking = false,
  size = 64,
  theme = "auto",
  state,
  className,
  label = "Finna",
}: FinnaOrbProps) {
  const resolved: OrbState = state ?? "composing"

  return (
    <ThinkingOrb
      state={resolved}
      size={size}
      theme={theme}
      aria-label={label}
      className={cn("shrink-0", className)}
    />
  )
}
