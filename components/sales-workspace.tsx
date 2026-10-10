"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AudioLines,
  Loader2,
  Mic,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UserPlus,
  type LucideIcon,
} from "lucide-react"

import { FinnaVoiceBeam } from "@/components/finna-voice-beam"
import { useFinnaVoice } from "@/hooks/use-finna-voice"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SALES_LEAD_STAGES, type SalesLeadStage } from "@/lib/sales/types"
import { cn } from "@/lib/utils"

export type SalesWorkspaceLead = {
  id: string
  name: string
  company: string
  email?: string
  title?: string
  segment?: string
  stage: SalesLeadStage
  score: number
  researchSummary?: string
  lastContact?: string | null
  updatedAt: string
}

export type SalesWorkspaceStats = {
  total: number
  byStage: Record<SalesLeadStage, number>
  needsFollowUp: number
}

const STAGE_COLORS: Record<SalesLeadStage, string> = {
  New: "border-slate-500/40 text-slate-700 dark:text-slate-300",
  Researched: "border-blue-500/40 text-blue-700 dark:text-blue-300",
  Contacted: "border-amber-500/40 text-amber-700 dark:text-amber-300",
  Replied: "border-green-500/40 text-green-700 dark:text-green-300",
  Meeting: "border-primary/40 text-primary",
  Won: "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  Lost: "border-red-500/40 text-red-700 dark:text-red-300",
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
  return name.slice(0, 1).toUpperCase() || "L"
}

export function SalesLeadsBoard({
  leads,
  stats,
  loading,
  error,
  query,
  onQueryChange,
  stageFilter,
  onStageFilterChange,
  busyId,
  onAddLead,
  onImport,
  onUpdateStage,
  onDeleteLead,
}: {
  leads: SalesWorkspaceLead[]
  stats: SalesWorkspaceStats | null
  loading: boolean
  error: string | null
  query: string
  onQueryChange: (value: string) => void
  stageFilter: string
  onStageFilterChange: (value: string) => void
  busyId: string | null
  onAddLead: () => void
  onImport: () => void
  onUpdateStage: (leadId: string, stage: SalesLeadStage) => void
  onDeleteLead: (leadId: string) => void
}) {
  const total = stats?.total ?? 0
  const followUp = stats?.needsFollowUp ?? 0
  const active =
    (stats?.byStage.Contacted ?? 0) +
    (stats?.byStage.Replied ?? 0) +
    (stats?.byStage.Meeting ?? 0)
  const maxStage = Math.max(1, ...SALES_LEAD_STAGES.map((stage) => stats?.byStage[stage] ?? 0))

  const summary =
    total === 0
      ? "Add or import leads to start the pipeline. Ace can research them and draft outreach from what you already have."
      : `${total} lead${total === 1 ? "" : "s"} in the pipeline. ${active} in conversation. ${followUp} need a follow-up.`

  return (
    <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#171717]">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">:</span>
          <h2 className="text-sm font-medium text-neutral-900 dark:text-white">Leads</h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search leads"
              className="h-8 w-[160px] rounded-full border-black/[0.08] bg-neutral-50 pl-8 text-xs shadow-none dark:bg-[#222]"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </div>
          <Select value={stageFilter} onValueChange={onStageFilterChange}>
            <SelectTrigger className="h-8 w-[130px] rounded-full border-black/[0.08] bg-neutral-50 text-xs shadow-none dark:bg-[#222]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {SALES_LEAD_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={onAddLead}
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Add lead
          </Button>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="grid overflow-hidden rounded-xl border border-violet-200/70 bg-gradient-to-br from-white via-white to-violet-50/80 dark:border-white/10 dark:from-[#1c1c1c] dark:to-[#1a1720] sm:grid-cols-[1.4fr_1fr]">
          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-neutral-500">Summary</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {summary}
            </p>
          </div>
          <div className="border-t border-black/[0.04] p-4 sm:border-l sm:border-t-0 dark:border-white/[0.06] sm:p-5">
            <p className="text-xs font-medium text-neutral-500">Need follow-up</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
              {followUp}
              <span className="ml-2 text-sm font-medium text-neutral-400">7d+</span>
            </p>
            <div className="mt-4 flex h-8 items-end gap-1">
              {SALES_LEAD_STAGES.map((stage) => {
                const count = stats?.byStage[stage] ?? 0
                const height = count === 0 ? 12 : Math.max(18, Math.round((count / maxStage) * 100))
                return (
                  <div
                    key={stage}
                    title={`${stage}: ${count}`}
                    className="flex-1 rounded-sm bg-violet-200/80 dark:bg-violet-400/30"
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-black/[0.04] px-2 pb-2 dark:divide-white/[0.06]">
        {loading ? (
          <div className="flex items-center gap-2 px-4 py-10 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading leads…
          </div>
        ) : error ? (
          <p className="px-4 py-10 text-sm text-destructive">{error}</p>
        ) : leads.length === 0 ? (
          <>
            <SetupRow
              icon={UserPlus}
              title="Add a lead"
              description="Start with a name and company. Email and title can come later."
              action="Add"
              onClick={onAddLead}
            />
            <SetupRow
              icon={Upload}
              title="Import a CSV"
              description="Bring in a list with name, company, and optional email."
              action="Import"
              onClick={onImport}
            />
            <SetupRow
              icon={Sparkles}
              title="Ask Ace to find leads"
              description="The sales rep can research and suggest contacts from your brief."
              action="Open"
              href="/founder/ai/ai-sales-rep/chat"
            />
          </>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className="flex flex-col gap-3 px-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700 dark:bg-[#262626] dark:text-neutral-200">
                  {initials(lead.name)}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                      {lead.name}
                    </p>
                    <Badge variant="outline" className={cn("h-5 text-[10px]", STAGE_COLORS[lead.stage])}>
                      {lead.stage}
                    </Badge>
                    {lead.segment ? (
                      <Badge variant="secondary" className="h-5 text-[10px]">
                        {lead.segment}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {lead.title ? `${lead.title} · ` : ""}
                    {lead.company}
                    {lead.email ? ` · ${lead.email}` : ""}
                  </p>
                  {lead.researchSummary ? (
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{lead.researchSummary}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
                <Select
                  value={lead.stage}
                  onValueChange={(value) => onUpdateStage(lead.id, value as SalesLeadStage)}
                  disabled={busyId === lead.id}
                >
                  <SelectTrigger className="h-8 w-[120px] rounded-full border-black/[0.08] bg-white text-xs shadow-none dark:bg-[#222]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALES_LEAD_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busyId === lead.id}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/founder/ai/ai-sales-rep/chat?lead=${lead.id}`}>
                        Research with Ace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={(event) => {
                        event.preventDefault()
                        void onDeleteLead(lead.id)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

function SetupRow({
  icon: Icon,
  title,
  description,
  action,
  href,
  onClick,
}: {
  icon: LucideIcon
  title: string
  description: string
  action: string
  href?: string
  onClick?: () => void
}) {
  const button = (
    <span className="inline-flex h-8 items-center rounded-full border border-black/[0.08] bg-white px-3 text-xs font-medium text-neutral-700 dark:border-white/10 dark:bg-[#222] dark:text-neutral-200">
      {action}
    </span>
  )

  return (
    <div className="flex items-center gap-3 px-3 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-[#262626]">
        <Icon className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-white">{title}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      {href ? <Link href={href}>{button}</Link> : <button type="button" onClick={onClick}>{button}</button>}
    </div>
  )
}

export function SalesFinnaComposer({ onAddLead }: { onAddLead: () => void }) {
  const router = useRouter()
  const [draft, setDraft] = useState("")
  const voice = useFinnaVoice({
    onFinalTranscript: (text) => {
      setDraft((prev) => [prev, text].filter(Boolean).join(" ").trim())
    },
  })

  const askFinna = () => {
    const text = draft.trim()
    if (!text) {
      router.push("/finna")
      return
    }
    router.push(`/finna?q=${encodeURIComponent(text)}`)
  }

  return (
    <div className="sticky bottom-20 z-20 mx-auto w-full max-w-xl overflow-visible px-1 lg:bottom-4">
      <FinnaVoiceBeam
        stream={voice.listening ? voice.stream : null}
        type="pill"
        theme="light"
        scale={1.2}
        idle={0.5}
        strength={1}
      >
        <div className="flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#171717]">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                askFinna()
              }
            }}
            placeholder={voice.listening ? "Listening…" : "Ask Finna about a lead or draft outreach…"}
            className="h-9 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
          />
          {voice.supported ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 shrink-0 rounded-full",
                voice.listening && "text-red-500 hover:text-red-500",
              )}
              onClick={() => void voice.toggle()}
              aria-label={voice.listening ? "Stop listening" : "Voice input"}
            >
              <Mic className="h-4 w-4" />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
            onClick={onAddLead}
            aria-label="Add lead"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
            onClick={askFinna}
            aria-label="Ask Finna"
          >
            <AudioLines className="h-4 w-4" strokeWidth={2.25} />
          </Button>
        </div>
      </FinnaVoiceBeam>
    </div>
  )
}

