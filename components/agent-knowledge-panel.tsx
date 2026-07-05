"use client"

import { useCallback, useEffect, useState } from "react"
import { BookOpen, Loader2, RefreshCw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type KnowledgeSource = {
  id: string
  title: string
  sourceType: string
  status: string
  chunkCount: number
  category?: string
  updatedAt: string
}

export function AgentKnowledgePanel() {
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [status, setStatus] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/agents/knowledge", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load knowledge sources")
      const data = await res.json()
      setSources(data.sources ?? [])
      setStatus(data.status ?? "")
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function ingestNote() {
    if (!title.trim() || !content.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/agents/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category: "note" }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to index note")
      }
      setTitle("")
      setContent("")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to index")
    } finally {
      setBusy(false)
    }
  }

  async function syncWorkspaces() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/agents/knowledge/sync-workspace", { method: "POST" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Workspace sync failed")
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed")
    } finally {
      setBusy(false)
    }
  }

  async function removeSource(id: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/agents/knowledge/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete source")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-4 w-4" />
            Knowledge base
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Index notes and workspace memos for agent RAG. {status}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={syncWorkspaces} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
          Sync workspaces
        </Button>
      </div>

      <div className="grid gap-2">
        <Input
          placeholder="Note title (e.g. Q2 investor memo)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={busy}
        />
        <Textarea
          placeholder="Paste text to index for agents. Data room uploads are indexed automatically."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          disabled={busy}
        />
        <Button onClick={ingestNote} disabled={busy || !title.trim() || !content.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Index note
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="space-y-2">
        <div className="text-sm font-medium">Indexed sources ({sources.length})</div>
        {loading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : sources.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sources yet. Add a note or sync workspaces from /founder/workspace.
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{source.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {source.sourceType} · {source.status} · {source.chunkCount} chunks
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSource(source.id)}
                  disabled={busy}
                  aria-label="Delete source"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
