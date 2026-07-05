"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { UploadButton } from "@uploadthing/react"
import {
  Brain,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react"

import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { formatFileSize } from "@/lib/documents/service"
import {
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
  type DocumentIndexStatus,
} from "@/lib/documents/types"
import { cn } from "@/lib/utils"

type DocumentRow = {
  id: string
  name: string
  category: DocumentCategory
  fileType: string
  sizeBytes: number
  url: string
  shared: boolean
  uploadedByName?: string
  indexStatus: DocumentIndexStatus
  indexError?: string
  createdAt: string
}

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  Fundraising: "text-primary",
  Financials: "text-blue-500",
  Legal: "text-purple-500",
  Product: "text-pink-500",
  Marketing: "text-orange-500",
}

function fileIcon(fileType: string) {
  if (fileType === "Spreadsheet") return FileSpreadsheet
  if (fileType === "PDF" || fileType === "Text") return FileText
  return File
}

function indexBadge(status: DocumentIndexStatus) {
  switch (status) {
    case "indexed":
      return (
        <Badge variant="secondary" className="gap-1">
          <Brain className="h-3 w-3" />
          AI indexed
        </Badge>
      )
    case "pending":
      return <Badge variant="outline">Indexing…</Badge>
    case "failed":
      return <Badge variant="destructive">Index failed</Badge>
    case "unsupported":
      return <Badge variant="outline">Not indexed</Badge>
  }
}

export function DocumentsView() {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>("Fundraising")
  const [uploadName, setUploadName] = useState("")
  const [uploadShared, setUploadShared] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const loadDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/founder/documents", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load documents")
      setDocuments(data.documents ?? [])
      setCategoryCounts(data.categoryCounts ?? {})
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return documents.filter((doc) => {
      if (categoryFilter !== "all" && doc.category !== categoryFilter) return false
      if (!q) return true
      const hay = `${doc.name} ${doc.category} ${doc.fileType} ${doc.uploadedByName ?? ""}`
      return hay.toLowerCase().includes(q)
    })
  }, [documents, query, categoryFilter])

  async function deleteDocument(id: string) {
    if (!confirm("Delete this document? It will also be removed from AI knowledge.")) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/founder/documents/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete")
      }
      await loadDocuments()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete document")
    } finally {
      setBusyId(null)
    }
  }

  async function reindexDocument(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/founder/documents/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reindex" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to reindex")
      await loadDocuments()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reindex document")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Documents"
        description="Upload and manage your data room. PDF and text files are auto-indexed for AI agents."
        actions={
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {DOCUMENT_CATEGORIES.map((category) => (
          <Card
            key={category}
            className={cn(
              "cursor-pointer hover:bg-accent/50 transition-colors",
              categoryFilter === category && "ring-2 ring-primary/30"
            )}
            onClick={() =>
              setCategoryFilter((cur) => (cur === category ? "all" : category))
            }
          >
            <CardContent className="pt-6">
              <div className="space-y-2">
                <FolderOpen className={cn("h-8 w-8 mb-2", CATEGORY_COLORS[category])} />
                <p className="text-sm font-medium text-muted-foreground">{category}</p>
                <p className="text-2xl font-bold">{categoryCounts[category] ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All Documents</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-9 w-[240px]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {DOCUMENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCategoryFilter("all")
                  setQuery("")
                }}
                title="Clear filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading documents…
            </div>
          ) : error ? (
            <div className="text-sm text-destructive py-8">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {documents.length === 0
                  ? "No documents yet. Upload a pitch deck, financial model, or legal doc to get started."
                  : "No documents match your filters."}
              </p>
              {documents.length === 0 ? (
                <Button className="mt-4" size="sm" onClick={() => setUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload your first document
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((doc) => {
                const Icon = fileIcon(doc.fileType)
                const busy = busyId === doc.id
                return (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold truncate">{doc.name}</p>
                          <Badge variant="outline">{doc.category}</Badge>
                          {doc.shared ? <Badge variant="secondary">Shared</Badge> : null}
                          {indexBadge(doc.indexStatus)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>{doc.fileType}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.sizeBytes)}</span>
                          {doc.uploadedByName ? (
                            <>
                              <span>•</span>
                              <span>Uploaded by {doc.uploadedByName}</span>
                            </>
                          ) : null}
                          <span>•</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                        {doc.indexError ? (
                          <p className="text-xs text-destructive">{doc.indexError}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" title="View">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.url} download title="Download">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      {doc.indexStatus === "failed" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busy}
                          onClick={() => reindexDocument(doc.id)}
                          title="Retry AI indexing"
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={busy}
                        onClick={() => deleteDocument(doc.id)}
                        title="Delete"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>
              PDF and text files are automatically indexed so AI agents can search your data room.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-category">Category</Label>
              <Select
                value={uploadCategory}
                onValueChange={(value) => setUploadCategory(value as DocumentCategory)}
              >
                <SelectTrigger id="doc-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-name">Display name (optional)</Label>
              <Input
                id="doc-name"
                placeholder="e.g. Series A Pitch Deck"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <div>
                <div className="text-sm font-medium">Share with investors</div>
                <div className="text-xs text-muted-foreground">
                  Mark as shared in your data room
                </div>
              </div>
              <Switch checked={uploadShared} onCheckedChange={setUploadShared} />
            </div>

            <UploadButton<OurFileRouter, "dataRoomDocument">
              endpoint="dataRoomDocument"
              input={{
                category: uploadCategory,
                shared: uploadShared,
                name: uploadName.trim() || undefined,
              }}
              onClientUploadComplete={async () => {
                setUploadOpen(false)
                setUploadName("")
                setUploadShared(false)
                await loadDocuments()
              }}
              onUploadError={(err) => {
                alert(err.message || "Upload failed")
              }}
              className="ut-button:w-full ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-lg ut-button:font-medium ut-button:px-4 ut-button:py-2"
              content={{
                button: ({ ready, isUploading }) => (
                  <div className="flex items-center justify-center gap-2 w-full">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>
                      {isUploading
                        ? "Uploading & indexing…"
                        : ready
                          ? "Choose file & upload"
                          : "Preparing…"}
                    </span>
                  </div>
                ),
                allowedContent: "PDF or text files up to 16MB",
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
