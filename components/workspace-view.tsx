"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  FileText,
  Heading1,
  Heading2,
  Table2,
  BarChart3,
  MessageSquare,
  StickyNote,
  Circle,
  Users,
  MoreHorizontal,
  GripVertical,
  ChevronDown,
  Trash2,
  Pencil,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

// Types for workspace structure
type BlockType = "paragraph" | "heading1" | "heading2" | "table" | "metric" | "comment" | "sticky"

interface Block {
  id: string
  type: BlockType
  content: string
  order: number
  meta?: Record<string, unknown>
}

interface WorkspacePage {
  id: string
  title: string
  workspaceId: string
  order: number
  blocks: Block[]
}

interface Workspace {
  id: string
  name: string
  type: "deal" | "fund" | "data-room" | "memo"
  icon: string
  pages: WorkspacePage[]
}

// Default workspaces (investor + founder relevant)
const defaultWorkspaces: Workspace[] = [
  {
    id: "ws-1",
    name: "Deal Memos",
    type: "memo",
    icon: "📋",
    pages: [
      {
        id: "p-1",
        title: "Untitled",
        workspaceId: "ws-1",
        order: 0,
        blocks: [
          { id: "b-1", type: "heading1", content: "Executive summary", order: 0 },
          {
            id: "b-2",
            type: "paragraph",
            content: "Add context, thesis, and key metrics for this deal. Replace PDFs and scattered notes with one living document.",
            order: 1,
          },
          { id: "b-3", type: "heading2", content: "Market & traction", order: 2 },
          { id: "b-4", type: "paragraph", content: "", order: 3 },
          { id: "b-5", type: "metric", content: "Conviction score", order: 4, meta: { value: "8.2", label: "Out of 10" } },
        ],
      },
    ],
  },
  {
    id: "ws-2",
    name: "Data room",
    type: "data-room",
    icon: "📁",
    pages: [
      {
        id: "p-2",
        title: "Due diligence checklist",
        workspaceId: "ws-2",
        order: 0,
        blocks: [
          { id: "b-6", type: "heading1", content: "Checklist", order: 0 },
          { id: "b-7", type: "table", content: "Legal|Cap table|Financials|Status", order: 1, meta: { rows: ["Legal", "Cap table", "Financials"], cols: ["Item", "Status"] } },
        ],
      },
    ],
  },
  {
    id: "ws-3",
    name: "Fund docs",
    type: "fund",
    icon: "📊",
    pages: [
      {
        id: "p-3",
        title: "LP update — January 2025",
        workspaceId: "ws-3",
        order: 0,
        blocks: [
          { id: "b-8", type: "heading1", content: "Portfolio highlights", order: 0 },
          { id: "b-9", type: "paragraph", content: "Draft and share updates with LPs in one place. No more email threads.", order: 1 },
        ],
      },
    ],
  },
]

function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function WorkspaceView() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(defaultWorkspaces)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(defaultWorkspaces[0].id)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(defaultWorkspaces[0].pages[0]?.id ?? null)
  const [addingBlock, setAddingBlock] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [renamePageOpen, setRenamePageOpen] = useState(false)
  const [renamePageTitle, setRenamePageTitle] = useState("")
  const [deletePageOpen, setDeletePageOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/workspace")
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (data.workspaces?.length > 0) {
          const withPages = data.workspaces.map((w: any) => ({
            id: w.id,
            name: w.name,
            type: w.type || "memo",
            icon: w.icon || "📋",
            pages: Array.isArray(w.pages) ? w.pages : [],
          }))
          setWorkspaces(withPages)
          const first = withPages[0]
          if (first) {
            setSelectedWorkspaceId(first.id)
            setSelectedPageId(first.pages[0]?.id ?? null)
          }
        }
      } catch (_) {
        // keep default workspaces
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const selectedWorkspace = workspaces.find((w) => w.id === selectedWorkspaceId)
  const selectedPage = selectedWorkspace?.pages.find((p) => p.id === selectedPageId)
  const blocks = selectedPage?.blocks ?? []

  const updateBlocks = (updater: (prev: Block[]) => Block[]) => {
    if (!selectedWorkspace || !selectedPage) return
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id !== selectedWorkspace.id) return w
        return {
          ...w,
          pages: w.pages.map((p) => {
            if (p.id !== selectedPage.id) return p
            return { ...p, blocks: updater(p.blocks) }
          }),
        }
      })
    )
  }

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: type === "heading1" ? "Heading" : type === "heading2" ? "Subheading" : type === "sticky" ? "" : type === "comment" ? "" : "",
      order: blocks.length,
      ...(type === "table" && {
        meta: {
          columns: ["Item", "Status"],
          rows: [
            ["Legal", "—"],
            ["Cap table", "—"],
            ["Financials", "—"],
          ],
        },
      }),
      ...(type === "metric" && {
        meta: { label: "Metric", value: "—" },
      }),
    }
    updateBlocks((prev) => [...prev, newBlock])
    setAddingBlock(null)
  }

  const updateBlockContent = (blockId: string, content: string) => {
    updateBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content } : b))
    )
  }

  const updateBlockMeta = (blockId: string, metaPatch: Record<string, unknown>) => {
    updateBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, meta: { ...(b.meta ?? {}), ...metaPatch } }
          : b
      )
    )
  }

  const updatePageTitle = (pageId: string, title: string) => {
    const newTitle = title.trim() || "Untitled"
    setWorkspaces((prev) =>
      prev.map((w) => {
        const hasPage = w.pages.some((p) => p.id === pageId)
        if (!hasPage) return w
        return {
          ...w,
          pages: w.pages.map((p) =>
            p.id === pageId ? { ...p, title: newTitle } : p
          ),
        }
      })
    )
    setRenamePageOpen(false)
  }

  const deleteBlock = (blockId: string) => {
    updateBlocks((prev) => {
      const next = prev.filter((b) => b.id !== blockId)
      return next.map((b, i) => ({ ...b, order: i }))
    })
  }

  const deletePage = (pageId: string) => {
    if (!selectedWorkspace) return
    const pages = selectedWorkspace.pages.filter((p) => p.id !== pageId)
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id !== selectedWorkspace.id ? w : { ...w, pages }
      )
    )
    if (selectedPageId === pageId) {
      const next = pages[0]
      setSelectedPageId(next?.id ?? null)
    }
    setDeletePageOpen(false)
  }

  const createNewWorkspace = async () => {
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New workspace", type: "memo", icon: "📋" }),
      })
      if (!res.ok) return
      const w = await res.json()
      const newWs: Workspace = {
        id: w.id,
        name: w.name,
        type: w.type,
        icon: w.icon,
        pages: [],
      }
      setWorkspaces((prev) => [...prev, newWs])
      setSelectedWorkspaceId(newWs.id)
      setSelectedPageId(null)
    } catch (_) {}
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Rename page dialog */}
      <Dialog open={renamePageOpen} onOpenChange={setRenamePageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename page</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Input
              value={renamePageTitle}
              onChange={(e) => setRenamePageTitle(e.target.value)}
              placeholder="Page title"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (selectedPage) updatePageTitle(selectedPage.id, renamePageTitle)
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenamePageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedPage) updatePageTitle(selectedPage.id, renamePageTitle)
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete page confirmation */}
      <AlertDialog open={deletePageOpen} onOpenChange={setDeletePageOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedPage?.title}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedPage && deletePage(selectedPage.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Top bar: workspace + page on the page */}
      <header className="shrink-0 flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border bg-background">
        <Select
          value={selectedWorkspaceId}
          onValueChange={(id) => {
            if (id === "__new_workspace__") {
              createNewWorkspace()
              return
            }
            setSelectedWorkspaceId(id)
            const ws = workspaces.find((w) => w.id === id)
            setSelectedPageId(ws?.pages[0]?.id ?? null)
          }}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Workspace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__new_workspace__">
              <span className="flex items-center gap-2 text-primary font-medium">
                <Plus className="h-4 w-4" />
                Add new workspace
              </span>
            </SelectItem>
            {workspaces.map((ws) => (
              <SelectItem key={ws.id} value={ws.id}>
                {ws.icon} {ws.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedWorkspace && (
          <>
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            {selectedWorkspace.pages.length > 0 ? (
              <>
                <Select
                  value={selectedPageId ?? ""}
                  onValueChange={(id) => setSelectedPageId(id)}
                >
                  <SelectTrigger
                    className="w-[220px] h-9 cursor-pointer"
                    onDoubleClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (selectedPage) {
                        setRenamePageTitle(selectedPage.title)
                        setRenamePageOpen(true)
                      }
                    }}
                  >
                    <SelectValue placeholder="Page" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedWorkspace.pages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title || "Untitled"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    const newPage: WorkspacePage = {
                      id: generateId(),
                      title: "Untitled",
                      workspaceId: selectedWorkspace.id,
                      order: selectedWorkspace.pages.length,
                      blocks: [],
                    }
                    setWorkspaces((prev) =>
                      prev.map((w) =>
                        w.id === selectedWorkspace.id
                          ? { ...w, pages: [...w.pages, newPage] }
                          : w
                      )
                    )
                    setSelectedPageId(newPage.id)
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New page
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => {
                  const newPage: WorkspacePage = {
                    id: generateId(),
                    title: "Untitled",
                    workspaceId: selectedWorkspace.id,
                    order: 0,
                    blocks: [],
                  }
                  setWorkspaces((prev) =>
                    prev.map((w) =>
                      w.id === selectedWorkspace.id
                        ? { ...w, pages: [newPage] }
                        : w
                    )
                  )
                  setSelectedPageId(newPage.id)
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                New page
              </Button>
            )}
          </>
        )}

        <div className="flex-1 min-w-0" />
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <Circle className="h-1.5 w-1.5 fill-current animate-pulse" />
              Live
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Users className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    if (selectedPage) {
                      setRenamePageTitle(selectedPage.title)
                      setRenamePageOpen(true)
                    }
                  }}
                  disabled={!selectedPage}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename page
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => selectedPage && setDeletePageOpen(true)}
                  disabled={!selectedPage}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuItem>Comments</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">Loading workspace…</p>
            </div>
          ) : selectedPage ? (
            <div className="max-w-3xl mx-auto py-8 px-4 lg:px-8">
              {blocks.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-sm mb-4">This page is empty. Add a block to get started.</p>
                  <DropdownMenu open={addingBlock === "empty"} onOpenChange={(o) => setAddingBlock(o ? "empty" : null)}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add block
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56">
                      <DropdownMenuItem onClick={() => addBlock("paragraph")}>
                        <FileText className="h-4 w-4 mr-2" /> Paragraph
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addBlock("heading1")}>
                        <Heading1 className="h-4 w-4 mr-2" /> Heading 1
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addBlock("heading2")}>
                        <Heading2 className="h-4 w-4 mr-2" /> Heading 2
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addBlock("table")}>
                        <Table2 className="h-4 w-4 mr-2" /> Table
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addBlock("metric")}>
                        <BarChart3 className="h-4 w-4 mr-2" /> Metric
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addBlock("comment")}>
                        <MessageSquare className="h-4 w-4 mr-2" /> Comment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addBlock("sticky")}>
                        <StickyNote className="h-4 w-4 mr-2" /> Sticky note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="space-y-1">
                  {blocks
                    .sort((a, b) => a.order - b.order)
                    .map((block) => (
                      <div
                        key={block.id}
                        className="group flex gap-2 items-start py-1 rounded-md hover:bg-muted/50 -mx-2 px-2"
                      >
                        <button
                          className="opacity-0 group-hover:opacity-100 mt-2 p-0.5 rounded hover:bg-muted cursor-grab text-muted-foreground shrink-0"
                          aria-label="Drag to reorder"
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          {block.type === "paragraph" && (
                            <Input
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              placeholder="Write something..."
                              className="border-0 shadow-none focus-visible:ring-0 text-base px-0 min-h-[1.5rem]"
                            />
                          )}
                          {block.type === "heading1" && (
                            <Input
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              placeholder="Heading 1"
                              className="border-0 shadow-none focus-visible:ring-0 text-2xl font-bold px-0 min-h-[2rem]"
                            />
                          )}
                          {block.type === "heading2" && (
                            <Input
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              placeholder="Heading 2"
                              className="border-0 shadow-none focus-visible:ring-0 text-xl font-semibold px-0 min-h-[1.75rem]"
                            />
                          )}
                          {block.type === "table" && (() => {
                            const rawCols = (block.meta?.columns ?? block.meta?.cols) as string[] | undefined
                            const rawRows = block.meta?.rows as string[][] | string[] | Array<{ item: string; status: string }> | undefined
                            let columns: string[] = ["Item", "Status"]
                            let rows: string[][] = [["Legal", "—"], ["Cap table", "—"], ["Financials", "—"]]
                            if (Array.isArray(rawRows) && rawRows.length > 0) {
                              const first = rawRows[0]
                              if (typeof first === "object" && first !== null && "item" in first) {
                                columns = ["Item", "Status"]
                                rows = (rawRows as Array<{ item: string; status: string }>).map((r) => [r.item, r.status])
                              } else if (Array.isArray(first)) {
                                columns = (rawCols?.length ? rawCols : columns).slice(0, (first as string[]).length) || columns
                                rows = rawRows as string[][]
                              } else {
                                columns = rawCols?.length ? rawCols : ["Item", "Status"]
                                rows = (rawRows as string[]).map((r) => [r, "—"])
                              }
                            } else if (rawCols?.length) {
                              columns = rawCols
                            }
                            const padRow = (row: string[]) => [...row, ...Array(Math.max(0, columns.length - row.length)).fill("—")]
                            const normalizedRows = rows.map((r) => padRow(r).slice(0, columns.length))
                            const setColumns = (next: string[]) => updateBlockMeta(block.id, { columns: next, rows: normalizedRows.map((r) => r.slice(0, next.length).concat(Array(Math.max(0, next.length - r.length)).fill("—"))) })
                            const setRows = (next: string[][]) => updateBlockMeta(block.id, { rows: next })
                            const addColumn = () => {
                              setColumns([...columns, "New column"])
                            }
                            const removeColumn = (colIndex: number) => {
                              if (columns.length <= 1) return
                              const nextCols = columns.filter((_, i) => i !== colIndex)
                              const nextRows = normalizedRows.map((r) => r.filter((_, i) => i !== colIndex))
                              updateBlockMeta(block.id, { columns: nextCols, rows: nextRows })
                            }
                            const addRow = () => {
                              setRows([...normalizedRows, Array(columns.length).fill("—")])
                            }
                            const removeRow = (rowIndex: number) => {
                              if (normalizedRows.length <= 1) return
                              setRows(normalizedRows.filter((_, i) => i !== rowIndex))
                            }
                            const setCell = (rowIndex: number, colIndex: number, value: string) => {
                              const next = normalizedRows.map((r, i) => (i === rowIndex ? r.map((c, j) => (j === colIndex ? value : c)) : r))
                              updateBlockMeta(block.id, { rows: next })
                            }
                            const setHeader = (colIndex: number, value: string) => {
                              const next = columns.map((c, i) => (i === colIndex ? value : c))
                              updateBlockMeta(block.id, { columns: next })
                            }
                            return (
                              <Card className="border-border/60">
                                <CardContent className="p-0">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-border">
                                        {columns.map((col, j) => (
                                          <th key={j} className="text-left p-2 font-medium align-top group/th">
                                            <div className="flex items-center gap-1">
                                              <Input
                                                value={col}
                                                onChange={(e) => setHeader(j, e.target.value)}
                                                className="border-0 shadow-none focus-visible:ring-0 h-8 px-2 text-sm font-medium"
                                              />
                                              {columns.length > 1 && (
                                                <button
                                                  type="button"
                                                  onClick={() => removeColumn(j)}
                                                  className="opacity-0 group-hover/th:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                                  aria-label="Remove column"
                                                >
                                                  <X className="h-3.5 w-3.5" />
                                                </button>
                                              )}
                                            </div>
                                          </th>
                                        ))}
                                        <th className="p-2 w-10 align-top">
                                          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={addColumn}>
                                            <Plus className="h-4 w-4" />
                                          </Button>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {normalizedRows.map((row, i) => (
                                        <tr key={i} className="border-b border-border/60 last:border-0 group/tr">
                                          {row.map((cell, j) => (
                                            <td key={j} className="p-2">
                                              <Input
                                                value={cell}
                                                onChange={(e) => setCell(i, j, e.target.value)}
                                                className="border-0 shadow-none focus-visible:ring-0 h-8 px-2 text-sm"
                                              />
                                            </td>
                                          ))}
                                          <td className="p-2 w-10 align-middle">
                                            {normalizedRows.length > 1 ? (
                                              <button
                                                type="button"
                                                onClick={() => removeRow(i)}
                                                className="opacity-0 group-hover/tr:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                                aria-label="Remove row"
                                              >
                                                <X className="h-3.5 w-3.5" />
                                              </button>
                                            ) : null}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div className="p-2 border-t border-border/60 flex gap-2">
                                    <Button type="button" variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={addRow}>
                                      <Plus className="h-4 w-4 mr-1" />
                                      Add row
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={addColumn}>
                                      <Plus className="h-4 w-4 mr-1" />
                                      Add column
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })()}
                          {block.type === "metric" && (
                            <Card className="border-border/60 max-w-xs">
                              <CardContent className="p-4 space-y-2">
                                <Input
                                  value={(block.meta?.label as string) ?? "Metric"}
                                  onChange={(e) => updateBlockMeta(block.id, { label: e.target.value })}
                                  className="border-0 shadow-none focus-visible:ring-0 h-auto py-0 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                                />
                                <Input
                                  value={(block.meta?.value as string) ?? "—"}
                                  onChange={(e) => updateBlockMeta(block.id, { value: e.target.value })}
                                  className="border-0 shadow-none focus-visible:ring-0 h-auto py-0 text-2xl font-bold"
                                />
                              </CardContent>
                            </Card>
                          )}
                          {block.type === "comment" && (
                            <div className="flex items-start gap-2 p-3 rounded-lg border border-dashed border-border bg-muted/30">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <Textarea
                                value={block.content}
                                onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                placeholder="Add a comment or discussion thread. @mention collaborators."
                                className="min-h-[80px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm text-foreground placeholder:text-muted-foreground flex-1"
                              />
                            </div>
                          )}
                          {block.type === "sticky" && (
                            <div className="w-full max-w-sm rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 shadow-md shadow-amber-200/50 dark:shadow-amber-900/20 p-4 min-h-[120px]">
                              <textarea
                                value={block.content}
                                onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                placeholder="Write a note..."
                                className="w-full min-h-[88px] resize-none border-0 bg-transparent text-sm text-amber-950 dark:text-amber-100 placeholder:text-amber-600/70 dark:placeholder:text-amber-400/50 focus:ring-0 focus-visible:ring-0 p-0"
                                rows={4}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteBlock(block.id)}
                          className="opacity-0 group-hover:opacity-100 mt-2 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                          aria-label="Delete block"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  {/* Add block inline */}
                  <div className="flex gap-2 items-center py-2">
                    <DropdownMenu open={!!addingBlock} onOpenChange={(o) => setAddingBlock(o ? "inline" : null)}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          <Plus className="h-4 w-4 mr-1" />
                          Add block
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem onClick={() => addBlock("paragraph")}>
                          <FileText className="h-4 w-4 mr-2" /> Paragraph
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addBlock("heading1")}>
                          <Heading1 className="h-4 w-4 mr-2" /> Heading 1
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addBlock("heading2")}>
                          <Heading2 className="h-4 w-4 mr-2" /> Heading 2
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addBlock("table")}>
                          <Table2 className="h-4 w-4 mr-2" /> Table
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addBlock("metric")}>
                          <BarChart3 className="h-4 w-4 mr-2" /> Metric
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addBlock("comment")}>
                          <MessageSquare className="h-4 w-4 mr-2" /> Comment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addBlock("sticky")}>
                          <StickyNote className="h-4 w-4 mr-2" /> Sticky note
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
            </div>
          ) : !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <p className="text-sm">Select a page from the sidebar or add one below.</p>
              {selectedWorkspace && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage: WorkspacePage = {
                      id: generateId(),
                      title: "Untitled",
                      workspaceId: selectedWorkspace.id,
                      order: selectedWorkspace.pages.length,
                      blocks: [],
                    }
                    setWorkspaces((prev) =>
                      prev.map((w) =>
                        w.id === selectedWorkspace.id
                          ? { ...w, pages: [...w.pages, newPage] }
                          : w
                      )
                    )
                    setSelectedPageId(newPage.id)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New page
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
  )
}
