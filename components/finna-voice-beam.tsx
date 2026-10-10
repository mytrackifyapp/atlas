"use client"

import { VoiceBeam, type VoiceBeamProps } from "voice-glow"

import { cn } from "@/lib/utils"

export function FinnaVoiceBeam({
  className,
  theme = "light",
  type = "pill",
  idle = 0.42,
  ...props
}: VoiceBeamProps) {
  return (
    <VoiceBeam
      type={type}
      theme={theme}
      idle={idle}
      className={cn("w-full min-w-0 overflow-visible", className)}
      {...props}
    />
  )
}
