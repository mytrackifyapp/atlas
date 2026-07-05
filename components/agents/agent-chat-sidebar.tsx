"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  Flame,
  FolderOpen,
  GitCompare,
  Handshake,
  Image,
  LineChart,
  List,
  Loader2,
  Mail,
  Megaphone,
  MessageSquare,
  MessagesSquare,
  Plus,
  Scale,
  Search,
  Shield,
  Sparkles,
  Target,
  UserPlus,
  Users,
  Wand2,
  Rocket,
  type LucideIcon,
} from "lucide-react"

import { AgentFoundationPanel } from "@/components/agents/agent-foundation-panel"
import { QuickFeatureCard, QUICK_FEATURE_GLOWS } from "@/components/agents/quick-feature-card"
import {
  getAgentChatSuggestions,
  getAgentLiveToolLabels,
  getAgentWorkspaceLinks,
  type AgentToolIcon,
} from "@/lib/agent-chat-sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ConversationSummary = {
  id: string
  title?: string
  updatedAt: string
  createdAt: string
}

type Props = {
  agentId: string
  agentBaseHref: string
  conversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onRunTool: (prompt: string) => void
  switchingConversation?: boolean
  className?: string
}

function formatConversationTitle(conversation: ConversationSummary) {
  if (conversation.title?.trim()) return conversation.title
  return `Chat · ${formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}`
}

const TOOL_ICON_MAP: Record<AgentToolIcon, LucideIcon> = {
  chart: LineChart,
  flame: Flame,
  "file-text": FileText,
  folder: FolderOpen,
  search: Search,
  shield: Shield,
  scale: Scale,
  users: Users,
  mail: Mail,
  messages: MessagesSquare,
  handshake: Handshake,
  image: Image,
  megaphone: Megaphone,
  target: Target,
  sparkles: Sparkles,
  list: List,
  clipboard: ClipboardList,
  calendar: Calendar,
  "git-compare": GitCompare,
  briefcase: Briefcase,
  "user-plus": UserPlus,
  wand: Wand2,
}

export function AgentChatSidebar({
  agentId,
  agentBaseHref,
  conversationId,
  onSelectConversation,
  onNewChat,
  onRunTool,
  switchingConversation,
  className,
}: Props) {
  const [tab, setTab] = useState<"history" | "setup" | "tools">("tools")
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const workspaceLinks = getAgentWorkspaceLinks(agentId)
  const suggestions = getAgentChatSuggestions(agentId)
  const liveTools = getAgentLiveToolLabels(agentId)
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/agents/conversations?agentId=${encodeURIComponent(agentId)}`)
      if (!res.ok) throw new Error("Failed to load history")
      const data = (await res.json()) as { conversations: ConversationSummary[] }
      setConversations(data.conversations ?? [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history")
    } finally {
      setLoadingHistory(false)
    }
  }, [agentId])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory, conversationId])

  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data: { isAdmin?: boolean }) => setIsAdmin(Boolean(data.isAdmin)))
      .catch(() => setIsAdmin(false))
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/agents/foundation?agentId=${encodeURIComponent(agentId)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { foundation?: { fields?: Record<string, string>; connectedTools?: string[]; attachments?: unknown[] } } | null) => {
        if (cancelled || !data?.foundation) {
          setTab("setup")
          return
        }
        const hasField = Object.values(data.foundation.fields ?? {}).some((v) => v?.trim())
        const hasTools = (data.foundation.connectedTools ?? []).length > 0
        const hasFiles = (data.foundation.attachments ?? []).length > 0
        if (!hasField && !hasTools && !hasFiles) setTab("setup")
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [agentId])

  const tabs = [
    { id: "history" as const, label: "History", icon: MessageSquare },
    { id: "setup" as const, label: "Setup", icon: ClipboardList },
    { id: "tools" as const, label: "Tools", icon: Rocket },
  ]

  return (
    <aside
      className={cn(
        "flex max-h-[calc(100dvh-7rem)] flex-col rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      <div className="flex gap-0.5 border-b border-neutral-100 p-1 dark:border-neutral-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "relative flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-1 py-2.5 text-[11px] font-medium transition-colors sm:px-1.5 sm:text-xs",
              tab === id
                ? "bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="inline-flex min-w-0 items-center gap-1">
              <span className="truncate">{label}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        {error ? <p className="mb-3 text-xs text-destructive">{error}</p> : null}

        {tab === "history" ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-neutral-500">Recent chats</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-lg px-2 text-xs"
                onClick={onNewChat}
              >
                <Plus className="h-3.5 w-3.5" />
                New
              </Button>
            </div>

            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {loadingHistory || switchingConversation ? (
                <div className="flex items-center gap-2 py-6 text-xs text-neutral-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading…
                </div>
              ) : conversations.length === 0 ? (
                <p className="py-6 text-xs leading-relaxed text-neutral-500">
                  No saved chats yet. Start a conversation and it will appear here.
                </p>
              ) : (
                conversations.map((conversation) => {
                  const active = conversation.id === conversationId
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => onSelectConversation(conversation.id)}
                      className={cn(
                        "w-full rounded-xl px-3 py-2.5 text-left transition-colors",
                        active
                          ? "bg-neutral-100 dark:bg-neutral-800"
                          : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                      )}
                    >
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {formatConversationTitle(conversation)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-500">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                      </p>
                    </button>
                  )
                })
              )}
            </div>
          </>
        ) : null}

        {tab === "setup" ? <AgentFoundationPanel agentId={agentId} /> : null}

        {tab === "tools" ? (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
            <p className="text-xs leading-relaxed text-neutral-500">
              Tap a shortcut to drop a tailored prompt into chat.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {suggestions.map((tool, index) => {
                const Icon = TOOL_ICON_MAP[tool.icon]
                return (
                  <QuickFeatureCard
                    key={tool.id}
                    title={tool.label}
                    features={[tool.description]}
                    glow={QUICK_FEATURE_GLOWS[index % QUICK_FEATURE_GLOWS.length]}
                    superpowers="Quick action"
                    icon={Icon}
                    onClick={() => onRunTool(tool.prompt)}
                  />
                )
              })}
            </div>

            {isAdmin && liveTools.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-neutral-500">Live data</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {liveTools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {workspaceLinks.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-neutral-500">Workspace</p>
                <div className="mt-2 space-y-1">
                  {workspaceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    >
                      <span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {link.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-neutral-500">
                          {link.description}
                        </span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  )
}
