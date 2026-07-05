"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Play, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChatMessageText } from "@/components/chat-message-text"

type AgentRun = {
  id: string
  agentId: string
  taskType: string
  status: string
  output?: { summary?: string }
  error?: string
  createdAt: string
}

type Props = {
  agentId?: string
}

export function AgentRunsPanel({ agentId = "ai-cfo" }: Props) {
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/api/agents/runs?agentId=${encodeURIComponent(agentId)}`
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load runs")
      const data = await res.json()
      setRuns(data.runs ?? [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    load()
  }, [load])

  async function triggerWeeklyDigest() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/agents/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, taskType: "cfo_weekly_digest" }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to start run")
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start run")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="p-4 sm:p-6 border-border/50 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Autonomous runs
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Scheduled and on-demand agent jobs (CFO weekly digest).
          </p>
        </div>
        <Button size="sm" onClick={triggerWeeklyDigest} disabled={busy}>
          {busy ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-1" />
          )}
          Run CFO brief
        </Button>
      </div>

      {error ? <div className="text-xs text-destructive">{error}</div> : null}

      {loading ? (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading runs…
        </div>
      ) : runs.length === 0 ? (
        <div className="text-xs text-muted-foreground">No runs yet. Trigger a CFO brief above.</div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-auto">
          {runs.slice(0, 5).map((run) => (
            <div key={run.id} className="rounded-xl border border-border/50 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium">{run.taskType}</span>
                <span className="text-muted-foreground">{run.status}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {new Date(run.createdAt).toLocaleString()}
              </div>
              {run.output?.summary ? (
                <div className="text-sm">
                  <ChatMessageText content={run.output.summary} />
                </div>
              ) : null}
              {run.error ? (
                <div className="text-xs text-destructive">{run.error}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
