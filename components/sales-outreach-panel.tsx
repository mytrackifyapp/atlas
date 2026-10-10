"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquareReply,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type OutreachStatus } from "@/lib/sales/types"
import { cn } from "@/lib/utils"

export type OutreachRow = {
  id: string
  leadId: string
  leadName?: string
  leadCompany?: string
  toEmail: string
  subject: string
  body: string
  status: OutreachStatus
  sequenceStep?: number
  scheduledFor?: string | null
  sentAt?: string | null
  error?: string
  updatedAt: string
}

const STATUS_COLORS: Record<OutreachStatus, string> = {
  draft: "border-slate-500/40 text-slate-700 dark:text-slate-300",
  pending_approval: "border-amber-500/40 text-amber-700 dark:text-amber-300",
  scheduled: "border-blue-500/40 text-blue-700 dark:text-blue-300",
  sent: "border-green-500/40 text-green-700 dark:text-green-300",
  replied: "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  cancelled: "border-muted text-muted-foreground",
  failed: "border-red-500/40 text-red-700 dark:text-red-300",
}

export function SalesOutreachPanel({
  onItemsChange,
}: {
  onItemsChange?: (items: OutreachRow[]) => void
}) {
  const [items, setItems] = useState<OutreachRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const onItemsChangeRef = useRef(onItemsChange)
  onItemsChangeRef.current = onItemsChange

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all" && statusFilter !== "active") {
        params.set("status", statusFilter)
      }

      const res = await fetch(`/api/sales/outreach?${params}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load outreach")

      let rows: OutreachRow[] = data.outreach ?? []
      if (statusFilter === "active") {
        rows = rows.filter((item) =>
          ["draft", "pending_approval", "scheduled", "failed"].includes(item.status)
        )
      }
      setItems(rows)
      onItemsChangeRef.current?.(data.outreach ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const draftCount = useMemo(
    () => items.filter((item) => item.status === "draft").length,
    [items]
  )
  const approvalCount = useMemo(
    () => items.filter((item) => item.status === "pending_approval").length,
    [items]
  )

  async function sendNow(id: string) {
    if (!confirm("Send this email now?")) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/sales/outreach/${id}/send`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Send failed")
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Send failed")
    } finally {
      setBusyId(null)
    }
  }

  async function logReply(id: string) {
    const notes = window.prompt("Optional notes about the reply:")
    if (notes === null) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/sales/outreach/${id}/log-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to log reply")
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusyId(null)
    }
  }

  async function deleteDraft(id: string) {
    if (!confirm("Delete this draft?")) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/sales/outreach/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <aside className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#171717]">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-sm font-medium text-neutral-900 dark:text-white">Outreach</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[120px] rounded-full border-black/[0.08] bg-neutral-50 text-xs shadow-none dark:bg-[#222]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-5 px-5 pb-5">
        <section className="space-y-2">
          <p className="text-xs font-medium text-neutral-400">Channels</p>
          <div className="space-y-1">
            <ConfigRow
              icon={<Mail className="h-3.5 w-3.5" />}
              label="Email drafts"
              value={loading ? "…" : String(draftCount)}
            />
            <ConfigRow
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              label="Approvals"
              value={loading ? "…" : String(approvalCount)}
              href="/founder/ai/approvals"
            />
            <ConfigRow
              icon={<Plus className="h-3.5 w-3.5" />}
              label="Draft with Ace"
              href="/founder/ai/ai-sales-rep/chat"
            />
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-xs font-medium text-neutral-400">Guardrails</p>
          <div className="space-y-2 rounded-xl bg-neutral-50 px-3 py-3 text-xs text-neutral-600 dark:bg-[#1f1f1f] dark:text-neutral-300">
            <p>Follow-up window: 7 days</p>
            <p>Stages: New → Won or Lost</p>
            <p>Send: review the draft first</p>
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-xs font-medium text-neutral-400">Queue</p>
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-xs text-neutral-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading…
            </div>
          ) : error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : items.length === 0 ? (
            <p className="text-xs leading-relaxed text-neutral-500">
              No outreach in this filter. Ask Ace to draft email for a lead.
            </p>
          ) : (
            <div className="space-y-3">
              {items.slice(0, 6).map((item) => (
                <div key={item.id} className="space-y-2 rounded-xl bg-neutral-50 px-3 py-3 dark:bg-[#1f1f1f]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {item.subject}
                      </p>
                      <p className="truncate text-[11px] text-neutral-500">
                        {item.toEmail}
                        {item.leadName ? ` · ${item.leadName}` : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0 text-[10px]", STATUS_COLORS[item.status])}>
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {item.error ? <p className="text-[11px] text-destructive">{item.error}</p> : null}
                  <div className="flex flex-wrap gap-1.5">
                    {item.status === "draft" || item.status === "failed" ? (
                      <>
                        <Button
                          size="sm"
                          className="h-7 rounded-full px-2.5 text-xs"
                          disabled={busyId === item.id}
                          onClick={() => sendNow(item.id)}
                        >
                          {busyId === item.id ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="mr-1 h-3 w-3" />
                          )}
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 rounded-full px-0"
                          disabled={busyId === item.id}
                          onClick={() => deleteDraft(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    ) : null}
                    {item.status === "pending_approval" ? (
                      <Button size="sm" variant="outline" className="h-7 rounded-full text-xs" asChild>
                        <Link href="/founder/ai/approvals">Review</Link>
                      </Button>
                    ) : null}
                    {item.status === "sent" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-full text-xs"
                        disabled={busyId === item.id}
                        onClick={() => logReply(item.id)}
                      >
                        <MessageSquareReply className="mr-1 h-3 w-3" />
                        Log reply
                      </Button>
                    ) : null}
                    {item.status === "replied" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 rounded-full px-2 text-xs"
                      onClick={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
                    >
                      {expandedId === item.id ? "Hide" : "Preview"}
                    </Button>
                  </div>
                  {expandedId === item.id ? (
                    <pre className="max-h-36 overflow-auto whitespace-pre-wrap text-[11px] text-neutral-600 dark:text-neutral-300">
                      {item.body}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </aside>
  )
}

function ConfigRow({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode
  label: string
  value?: string
  href?: string
}) {
  const inner = (
    <>
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 dark:bg-[#262626] dark:text-neutral-300">
        {icon}
      </span>
      <span className="flex-1 truncate text-sm text-neutral-800 dark:text-neutral-200">{label}</span>
      {value ? <span className="text-xs text-neutral-400">{value}</span> : <Plus className="h-3.5 w-3.5 text-neutral-400" />}
    </>
  )

  const className =
    "flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-[#1f1f1f]"

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    )
  }

  return <div className={className}>{inner}</div>
}
