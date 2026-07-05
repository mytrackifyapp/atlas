"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Check, Loader2, ShieldAlert, X } from "lucide-react"

import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Approval = {
  id: string
  agentId: string
  toolId: string
  status: "pending" | "approved" | "rejected"
  reason?: string
  createdAt: string
  input?: Record<string, unknown>
}

type Props = {
  agentBaseHref: string
}

function OutreachApprovalPreview({ input }: { input: Record<string, unknown> }) {
  const outreachId = typeof input.outreachId === "string" ? input.outreachId : null
  const [preview, setPreview] = useState<{
    subject: string
    toEmail: string
    body: string
    leadName?: string
  } | null>(null)
  const [loading, setLoading] = useState(Boolean(outreachId))

  useEffect(() => {
    if (!outreachId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/sales/outreach/${outreachId}`, { cache: "no-store" })
        const data = await res.json()
        if (!cancelled && res.ok && data.outreach) {
          setPreview({
            subject: data.outreach.subject,
            toEmail: data.outreach.toEmail,
            body: data.outreach.body,
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [outreachId])

  if (!outreachId) {
    return (
      <p className="text-xs text-muted-foreground mt-2">
        Outreach ID missing from approval request.
      </p>
    )
  }

  if (loading) {
    return (
      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading email preview…
      </p>
    )
  }

  if (!preview) return null

  return (
    <div className="mt-3 rounded-md border border-border/60 bg-muted/30 p-3 space-y-2 text-sm">
      <p>
        <span className="text-muted-foreground">To:</span> {preview.toEmail}
      </p>
      <p>
        <span className="text-muted-foreground">Subject:</span> {preview.subject}
      </p>
      <pre className="text-xs whitespace-pre-wrap max-h-36 overflow-auto text-muted-foreground">
        {preview.body}
      </pre>
    </div>
  )
}

export function AgentApprovalsInbox({ agentBaseHref }: Props) {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"pending" | "all">("pending")

  const agentName = useCallback((agentId: string) => {
    return AI_AGENTS_CATALOG.find((a) => a.id === agentId)?.name ?? agentId
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url =
        filter === "pending"
          ? "/api/agents/approvals?status=pending"
          : "/api/agents/approvals"
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load approvals")
      const data = await res.json()
      setApprovals(data.approvals ?? [])
      setPendingCount(data.pendingCount ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  async function resolve(id: string, action: "approve" | "reject") {
    setBusyId(id)
    try {
      const res = await fetch(`/api/agents/approvals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error("Failed to update approval")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update")
    } finally {
      setBusyId(null)
    }
  }

  const emptyMessage = useMemo(() => {
    if (filter === "pending") return "No pending approvals. You're all caught up."
    return "No approval history yet."
  }, [filter])

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldAlert className="h-4 w-4" />
            Human-in-the-loop
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Agent Approvals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review actions that require your sign-off before agents execute them.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={agentBaseHref}>← Back to AI Agents</Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          Pending {pendingCount > 0 ? `(${pendingCount})` : ""}
        </Button>
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading approvals…
        </div>
      ) : null}

      {error ? <div className="text-sm text-destructive">{error}</div> : null}

      {!loading && approvals.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">{emptyMessage}</Card>
      ) : null}

      <div className="space-y-3">
        {approvals.map((approval) => (
          <Card key={approval.id} className="p-4 sm:p-5 border-border/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  {agentName(approval.agentId)} · {approval.toolId}
                </div>
                <div className="text-xs text-muted-foreground">
                  Requested {new Date(approval.createdAt).toLocaleString()}
                </div>
                {approval.reason ? (
                  <div className="text-sm text-muted-foreground">{approval.reason}</div>
                ) : null}
                {approval.toolId === "send_outreach_email" && approval.input ? (
                  <OutreachApprovalPreview input={approval.input} />
                ) : null}
                <div
                  className={cn(
                    "inline-flex text-xs rounded-full px-2 py-0.5 border",
                    approval.status === "pending" && "border-amber-500/40 text-amber-700",
                    approval.status === "approved" && "border-green-500/40 text-green-700",
                    approval.status === "rejected" && "border-red-500/40 text-red-700"
                  )}
                >
                  {approval.status}
                </div>
              </div>

              {approval.status === "pending" ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === approval.id}
                    onClick={() => resolve(approval.id, "reject")}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    disabled={busyId === approval.id}
                    onClick={() => resolve(approval.id, "approve")}
                  >
                    {busyId === approval.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Approve
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
