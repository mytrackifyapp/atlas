"use client"

import { FinnaOrb } from "@/components/finna-orb"

export function FinnaThinkingPill() {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-neutral-950 py-1.5 pl-2 pr-3.5 ring-1 ring-white/10"
      role="status"
      aria-live="polite"
    >
      <FinnaOrb size={20} theme="dark" state="composing" label="Thinking" />
      <span className="text-[13px] font-normal tracking-tight text-neutral-300">
        Thinking...
      </span>
    </div>
  )
}
