"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpRight, Check, Loader2, ShieldAlert, X } from "lucide-react"

import { resolveAgentId } from "@/lib/ai-agents-catalog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Approval = {
  id: string
  agentId: string
  toolId: string
  status: "pending" | "approved" | "rejected"
  reason?: string
  createdAt: string
}

type Props = {
  agentId: string
  agentBaseHref: string
  onApprovalsChange?: () => void
}

function formatToolLabel(toolId: string) {
  return toolId.replace(/_/g, " ")
}

export function AgentChatApprovalsPanel({ agentId, agentBaseHref, onApprovalsChange }: Props) {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"pending" | "all">("pending")

  const resolvedAgentId = resolveAgentId(agentId)

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
      const data = (await res.json()) as { approvals?: Approval[] }
      const filtered = (data.approvals ?? []).filter(
        (a) => resolveAgentId(a.agentId) === resolvedAgentId,
      )
      setApprovals(filtered)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load approvals")
    } finally {
      setLoading(false)
    }
  }, [filter, resolvedAgentId])

  useEffect(() => {
    void load()
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
      onApprovalsChange?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update")
    } finally {
      setBusyId(null)
    }
  }

  const pendingCount = approvals.filter((a) => a.status === "pending").length

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="text-xs leading-relaxed text-neutral-500">
        Review actions this agent needs your sign-off on before running.
      </p>

      <div className="mt-3 flex gap-1.5">
        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            filter === "pending"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400",
          )}
        >
          Pending{filter === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
        </button>
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            filter === "all"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400",
          )}
        >
          All
        </button>
      </div>

      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

      <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-xs text-neutral-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading approvals…
          </div>
        ) : approvals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 px-3 py-8 text-center dark:border-neutral-800">
            <ShieldAlert className="mx-auto h-5 w-5 text-neutral-400" />
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
              {filter === "pending"
                ? "No pending approvals for this agent."
                : "No approval history for this agent yet."}
            </p>
          </div>
        ) : (
          approvals.map((approval) => (
            <div
              key={approval.id}
              className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {formatToolLabel(approval.toolId)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    {formatDistanceToNow(new Date(approval.createdAt), { addSuffix: true })}
                  </p>
                  {approval.reason ? (
                    <p className="mt-1.5 line-clamp-2 text-xs text-neutral-500">{approval.reason}</p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                    approval.status === "pending" &&
                      "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                    approval.status === "approved" &&
                      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                    approval.status === "rejected" && "bg-red-500/10 text-red-600 dark:text-red-400",
                  )}
                >
                  {approval.status}
                </span>
              </div>

              {approval.status === "pending" ? (
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 flex-1 rounded-lg text-xs"
                    disabled={busyId === approval.id}
                    onClick={() => resolve(approval.id, "reject")}
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 flex-1 rounded-lg text-xs"
                    disabled={busyId === approval.id}
                    onClick={() => resolve(approval.id, "approve")}
                  >
                    {busyId === approval.id ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="mr-1 h-3.5 w-3.5" />
                    )}
                    Approve
                  </Button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <Link
        href={`${agentBaseHref}/approvals`}
        className="mt-3 flex shrink-0 items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
      >
        View all approvals
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
