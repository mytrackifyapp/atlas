"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquareReply,
  Send,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type OutreachStatus } from "@/lib/sales/types"
import { cn } from "@/lib/utils"

type OutreachRow = {
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

export function SalesOutreachPanel() {
  const [items, setItems] = useState<OutreachRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
        rows = rows.filter((o) =>
          ["draft", "pending_approval", "scheduled", "failed"].includes(o.status)
        )
      }
      setItems(rows)
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
    () => items.filter((o) => o.status === "draft").length,
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
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Outreach
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Email drafts from Ace — review, send, or approve from{" "}
              <Link href="/founder/ai/approvals" className="underline underline-offset-2">
                Approvals
              </Link>
              .
            </p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Drafts only</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading outreach…
          </div>
        ) : error ? (
          <p className="text-sm text-destructive py-6">{error}</p>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            <Mail className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No outreach yet. Ask Ace to draft emails for your leads.</p>
            <Button size="sm" variant="outline" className="mt-4" asChild>
              <Link href="/founder/ai/ai-sales-rep/chat">Draft with Sales Rep</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {draftCount > 0 ? (
              <p className="text-xs text-muted-foreground">
                {draftCount} draft{draftCount === 1 ? "" : "s"} ready to send
              </p>
            ) : null}
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-border rounded-lg p-4 space-y-3 hover:bg-accent/20 transition-colors"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium truncate">{item.subject}</p>
                      <Badge variant="outline" className={cn(STATUS_COLORS[item.status])}>
                        {item.status.replace("_", " ")}
                      </Badge>
                      {item.sequenceStep ? (
                        <span className="text-xs text-muted-foreground">
                          Step {item.sequenceStep}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      To {item.toEmail}
                      {item.leadName ? ` · ${item.leadName}` : ""}
                      {item.leadCompany ? ` @ ${item.leadCompany}` : ""}
                    </p>
                    {item.scheduledFor ? (
                      <p className="text-xs text-muted-foreground">
                        Scheduled {new Date(item.scheduledFor).toLocaleString()}
                      </p>
                    ) : null}
                    {item.sentAt ? (
                      <p className="text-xs text-muted-foreground">
                        Sent {new Date(item.sentAt).toLocaleString()}
                      </p>
                    ) : null}
                    {item.error ? (
                      <p className="text-xs text-destructive">{item.error}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {item.status === "draft" || item.status === "failed" ? (
                      <>
                        <Button
                          size="sm"
                          disabled={busyId === item.id}
                          onClick={() => sendNow(item.id)}
                        >
                          {busyId === item.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-1" />
                          )}
                          Send now
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === item.id}
                          onClick={() => deleteDraft(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                    {item.status === "pending_approval" ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/founder/ai/approvals">Review approval</Link>
                      </Button>
                    ) : null}
                    {item.status === "sent" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.id}
                        onClick={() => logReply(item.id)}
                      >
                        <MessageSquareReply className="h-4 w-4 mr-1" />
                        Log reply
                      </Button>
                    ) : null}
                    {item.status === "replied" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1" />
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedId((cur) => (cur === item.id ? null : item.id))
                      }
                    >
                      {expandedId === item.id ? "Hide" : "Preview"}
                    </Button>
                  </div>
                </div>

                {expandedId === item.id ? (
                  <pre className="text-xs whitespace-pre-wrap rounded-md bg-muted/50 p-3 max-h-48 overflow-auto">
                    {item.body}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
