"use client"

import { useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"

export type TrackedAgentRun = {
  id: string
  agentId: string
  status: string
  conversationId?: string
  messagePreview?: string
  output?: { summary?: string }
  error?: string
}

const trackedRunIds = new Set<string>()

export function registerAgentTaskRun(runId: string) {
  trackedRunIds.add(runId)
}

type Options = {
  agentId?: string
  conversationId?: string | null
  onTaskComplete?: (run: TrackedAgentRun) => void
  enabled?: boolean
}

export function useAgentTaskNotifications(options: Options = {}) {
  const router = useRouter()
  const seenStatusRef = useRef<Map<string, string>>(new Map())
  const { agentId, conversationId, onTaskComplete, enabled = true } = options

  const poll = useCallback(async () => {
    if (trackedRunIds.size === 0) return

    const params = new URLSearchParams()
    if (agentId) params.set("agentId", agentId)

    const res = await fetch(`/api/agents/runs?${params}`, { cache: "no-store" })
    if (!res.ok) return

    const data = (await res.json()) as { runs?: TrackedAgentRun[] }
    const tracked = [...trackedRunIds]

    for (const run of data.runs ?? []) {
      if (!tracked.includes(run.id)) continue

      const prev = seenStatusRef.current.get(run.id)
      seenStatusRef.current.set(run.id, run.status)

      if (prev && prev !== run.status && ["completed", "failed"].includes(run.status)) {
        const agentName =
          AI_AGENTS_CATALOG.find((a) => a.id === run.agentId)?.name ?? "Agent"

        if (run.status === "completed") {
          toast.success(`${agentName} finished your task`, {
            description:
              run.messagePreview?.slice(0, 80) ??
              "Your response is ready in chat.",
            action: {
              label: "View",
              onClick: () => router.push(`/founder/ai/${run.agentId}/chat`),
            },
            duration: 10000,
          })
          onTaskComplete?.(run)
        } else {
          toast.error(`${agentName} task failed`, {
            description: run.error ?? "Try again in chat.",
            duration: 10000,
          })
          onTaskComplete?.(run)
        }

        trackedRunIds.delete(run.id)
      } else if (!prev) {
        seenStatusRef.current.set(run.id, run.status)
      }
    }
  }, [agentId, onTaskComplete, router])

  useEffect(() => {
    if (!enabled) return
    poll()
    const timer = window.setInterval(poll, 4000)
    return () => window.clearInterval(timer)
  }, [enabled, poll])
}

export function isLikelyLongRunningTask(message: string): boolean {
  const text = message.toLowerCase()
  if (text.length > 140) return true

  const patterns = [
    /\bsequence\b/,
    /\bmultiple\b/,
    /\bbatch\b/,
    /\ball (my )?leads\b/,
    /\beach lead\b/,
    /\bresearch .+ and (draft|write|send)\b/,
    /\bdraft .+ (emails?|sequences?)\b/,
    /\b\d+\s+(leads?|emails?|companies)\b/,
  ]

  return patterns.some((pattern) => pattern.test(text))
}
