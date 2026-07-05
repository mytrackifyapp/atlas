"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Calendar,
  Check,
  ClipboardList,
  Eye,
  FileSearch,
  FileText,
  Flame,
  FolderOpen,
  GitCompare,
  Handshake,
  Image as ImageIcon,
  Lightbulb,
  LineChart,
  List,
  Loader2,
  Mail,
  Megaphone,
  MessageSquare,
  MessagesSquare,
  Search,
  Settings2,
  Shield,
  Sparkles,
  Target,
  UserPlus,
  Users,
  Wand2,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { AI_AGENTS_CATALOG, resolveAgentId } from "@/lib/ai-agents-catalog"
import {
  getAgentMarketingContent,
  type AgentIconName,
  type AgentMarketingContent,
} from "@/lib/ai-agents-marketing"
import {
  getAgentChatSuggestions,
  getAgentLiveToolLabels,
  getAgentWorkspaceLinks,
  type AgentChatSuggestion,
  type AgentToolIcon,
} from "@/lib/agent-chat-sidebar"
import { getAgentChatHref } from "@/lib/agent-task-routing"
import { agentHasLiveTools } from "@/lib/agents/tool-map"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<AgentIconName, LucideIcon> = {
  "bar-chart": BarChart3,
  calendar: Calendar,
  eye: Eye,
  "file-search": FileSearch,
  lightbulb: Lightbulb,
  "message-square": MessageSquare,
  search: Search,
  sparkles: Sparkles,
  target: Target,
  users: Users,
  wrench: Wrench,
}

const SUGGESTION_ICON_MAP: Record<AgentToolIcon, LucideIcon> = {
  chart: LineChart,
  flame: Flame,
  "file-text": FileText,
  folder: FolderOpen,
  search: Search,
  shield: Shield,
  scale: Wrench,
  users: Users,
  mail: Mail,
  messages: MessagesSquare,
  handshake: Handshake,
  image: ImageIcon,
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

const AGENT_GLOW: Record<string, string> = {
  "ai-lawyer": "from-violet-500/30 via-fuchsia-500/12 to-transparent",
  "ai-cfo": "from-emerald-500/30 via-green-500/12 to-transparent",
  "ai-sales-rep": "from-sky-500/30 via-blue-500/12 to-transparent",
  "ai-marketer": "from-rose-500/30 via-pink-500/12 to-transparent",
  "ai-ops-manager": "from-amber-500/30 via-orange-500/12 to-transparent",
  "ai-hr": "from-cyan-500/30 via-teal-500/12 to-transparent",
}

type InstalledAgent = { agentId: string; installedAt: string; enabled: boolean }

async function fetchInstalled(): Promise<InstalledAgent[]> {
  const res = await fetch("/api/ai/installed")
  if (!res.ok) throw new Error("Failed to load installed agents")
  const json = await res.json()
  return (json.installed ?? []) as InstalledAgent[]
}

function AgentPortrait({
  agent,
  className,
  priority = false,
}: {
  agent: (typeof AI_AGENTS_CATALOG)[number]
  className?: string
  priority?: boolean
}) {
  const Icon = agent.icon

  if (agent.imageSrc) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-sm dark:border-neutral-700 dark:bg-neutral-800",
          className,
        )}
      >
        <Image
          src={agent.imageSrc}
          alt={agent.name}
          fill
          className="object-cover object-top"
          sizes="176px"
          priority={priority}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-900",
        className,
      )}
    >
      <Icon className="h-10 w-10 text-neutral-500" strokeWidth={1.25} />
    </div>
  )
}

function ChatDemoPreview({
  agent,
  content,
  activeStep,
}: {
  agent: (typeof AI_AGENTS_CATALOG)[number]
  content: AgentMarketingContent
  activeStep: number
}) {
  return (
    <div className="mx-auto w-full max-w-[300px] lg:max-w-none lg:sticky lg:top-24">
      <div className="rounded-[2rem] border-[7px] border-neutral-900 bg-neutral-900 p-1.5 shadow-2xl dark:border-neutral-700">
        <div className="overflow-hidden rounded-[1.35rem] bg-white dark:bg-neutral-950">
          <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
              {agent.category}
            </p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {content.roleTitle} · {content.displayName}
            </p>
          </div>
          <div className="space-y-3 px-4 py-5">
            {content.chatDemo.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  message.role === "user"
                    ? "ml-auto bg-[#c1ff72]/25 text-neutral-800 dark:text-neutral-200"
                    : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
                )}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div
            className="border-t border-neutral-100 px-4 py-2.5 dark:border-neutral-800"
            style={{ backgroundColor: `${content.accent}10` }}
          >
            <p className="text-[10px] font-medium text-neutral-500">
              Step {activeStep + 1}: {content.steps[activeStep]?.title}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickStartCard({
  suggestion,
  href,
  accent,
}: {
  suggestion: AgentChatSuggestion
  href: string
  accent: string
}) {
  const Icon = SUGGESTION_ICON_MAP[suggestion.icon]

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        style={{ backgroundColor: `${accent}18` }}
      >
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <p className="mt-3 text-sm font-semibold text-neutral-950 dark:text-white">{suggestion.label}</p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        {suggestion.description}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 transition-colors group-hover:text-neutral-700 dark:group-hover:text-neutral-200">
        Try in chat
        <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  )
}

function ActionButtons({
  chatHref,
  setupHref,
  isInstalled,
  busy,
  loading,
  onInstall,
  onUninstall,
  className,
  size = "lg",
}: {
  chatHref: string
  setupHref: string
  isInstalled: boolean
  busy: boolean
  loading: boolean
  onInstall: () => void
  onUninstall: () => void
  className?: string
  size?: "default" | "lg" | "sm"
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        asChild
        size={size}
        className="rounded-full bg-[#c1ff72] px-6 font-semibold text-neutral-950 hover:bg-[#b4f25f]"
      >
        <Link href={chatHref}>
          Open chat
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        size={size}
        className="rounded-full border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      >
        <Link href={setupHref}>
          <Settings2 className="mr-2 h-4 w-4" />
          Setup
        </Link>
      </Button>

      {isInstalled ? (
        <Button
          variant="outline"
          size={size}
          className="rounded-full border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
          onClick={onUninstall}
          disabled={busy || loading}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disable"}
        </Button>
      ) : (
        <Button
          variant="outline"
          size={size}
          className="rounded-full border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
          onClick={onInstall}
          disabled={busy || loading}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enable agent"}
        </Button>
      )}
    </div>
  )
}

export function AgentDetailView({ agentId }: { agentId: string }) {
  const pathname = usePathname()
  const [installed, setInstalled] = useState<InstalledAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)

  const agent = useMemo(() => {
    const resolved = resolveAgentId(agentId)
    return AI_AGENTS_CATALOG.find((item) => item.id === resolved)
  }, [agentId])

  const resolvedAgentId = resolveAgentId(agentId)
  const agentBaseHref = pathname.startsWith("/founder") ? "/founder/ai" : "/dashboard/ai"
  const chatHref = `${agentBaseHref}/${resolvedAgentId}/chat`
  const setupHref = chatHref
  const content = agent ? getAgentMarketingContent(agent) : null
  const glow = AGENT_GLOW[resolvedAgentId] ?? "from-neutral-400/20 to-transparent"
  const suggestions = getAgentChatSuggestions(resolvedAgentId).slice(0, 4)
  const workspaceLinks = getAgentWorkspaceLinks(resolvedAgentId)
  const liveTools = getAgentLiveToolLabels(resolvedAgentId)

  const isInstalled = installed.some(
    (item) => resolveAgentId(item.agentId) === resolvedAgentId,
  )

  const relatedAgents = useMemo(() => {
    if (!agent) return []
    return AI_AGENTS_CATALOG.filter(
      (item) => item.id !== agent.id && item.category === agent.category,
    ).slice(0, 4)
  }, [agent])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchInstalled()
      .then((data) => {
        if (cancelled) return
        setInstalled(data)
        setError(null)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed")
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function install() {
    setBusy(true)
    try {
      const res = await fetch("/api/ai/installed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: resolvedAgentId }),
      })
      if (!res.ok) throw new Error("Failed to enable agent")
      setInstalled(await fetchInstalled())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusy(false)
    }
  }

  async function uninstall() {
    setBusy(true)
    try {
      const res = await fetch(`/api/ai/installed/${resolvedAgentId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to disable agent")
      setInstalled(await fetchInstalled())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusy(false)
    }
  }

  if (!agent || !content) {
    return (
      <Card className="rounded-2xl border-neutral-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-lg text-neutral-500">Agent not found.</p>
        <Button asChild className="mt-4 rounded-full">
          <Link href={agentBaseHref}>Back to agents</Link>
        </Button>
      </Card>
    )
  }

  const actionProps = {
    chatHref,
    setupHref,
    isInstalled,
    busy,
    loading,
    onInstall: install,
    onUninstall: uninstall,
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl pb-28 lg:pb-12">
      <header className="sticky top-0 z-20 -mx-3 mb-5 flex items-center justify-between gap-3 border-b border-neutral-200/80 bg-[#f4f4f5]/90 px-3 py-3 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90 lg:static lg:mx-0 lg:mb-8 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <Link
          href={agentBaseHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">All agents</span>
        </Link>

        <div className="min-w-0 flex-1 text-center lg:hidden">
          <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
            {content.displayName}
          </p>
        </div>

        <div className="hidden lg:block">
          <ActionButtons {...actionProps} size="sm" />
        </div>

        <Button
          asChild
          size="sm"
          className="rounded-full bg-[#c1ff72] font-semibold text-neutral-950 hover:bg-[#b4f25f] lg:hidden"
        >
          <Link href={chatHref}>Chat</Link>
        </Button>
      </header>

      <section className="relative overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-white px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 dark:border-neutral-800 dark:bg-neutral-900">
        <div
          className={cn(
            "pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br blur-3xl dark:hidden",
            glow,
          )}
        />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-8">
            <div>
              <div className="mb-6 flex items-start gap-5 lg:hidden">
                <AgentPortrait agent={agent} priority className="h-28 w-24 shrink-0 sm:h-32 sm:w-28" />
                <div className="min-w-0 pt-1">
                  <AgentBadges
                    agent={agent}
                    isInstalled={isInstalled}
                    featureCount={content.features.length}
                  />
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
                    {content.displayName}
                  </h1>
                  <p className="mt-1 text-base text-neutral-500">{content.roleTitle}</p>
                </div>
              </div>

              <div className="hidden lg:block">
                <AgentBadges
                  agent={agent}
                  isInstalled={isInstalled}
                  featureCount={content.features.length}
                />
              </div>

              <h1 className="mt-5 hidden text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-5xl lg:block lg:text-[3.25rem] lg:leading-[1.05]">
                {content.displayName}
              </h1>
              <p className="mt-3 hidden text-xl text-neutral-500 sm:text-2xl lg:block">{content.roleTitle}</p>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-lg">
                {content.heroSubheadline}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {agent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {liveTools.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {liveTools.slice(0, 5).map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="hidden lg:block">
              <ActionButtons {...actionProps} />
            </div>
          </div>

          <AgentPortrait
            agent={agent}
            priority
            className="hidden h-44 w-36 shrink-0 ring-4 ring-white lg:block xl:h-48 xl:w-40 dark:ring-neutral-900"
          />
        </div>
      </section>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {suggestions.length > 0 ? (
        <section className="mt-8 space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Quick start
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-2xl">
              Try {content.displayName} on a real task
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((suggestion) => (
              <QuickStartCard
                key={suggestion.id}
                suggestion={suggestion}
                href={getAgentChatHref(agentBaseHref, resolvedAgentId, suggestion.prompt)}
                accent={content.accent}
              />
            ))}
          </div>
        </section>
      ) : null}

      {workspaceLinks.length > 0 ? (
        <section className="mt-8">
          <div className="flex flex-wrap gap-2">
            {workspaceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section
        className="relative mt-10 overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-white px-6 py-10 sm:px-10 sm:py-12 dark:border-neutral-800 dark:bg-neutral-900"
        style={{ borderLeftWidth: 4, borderLeftColor: content.accent }}
      >
        <p
          className="text-2xl font-medium leading-snug sm:text-3xl"
          style={{ color: content.accent }}
        >
          {content.pitchHeadline}
        </p>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-lg">
          {content.pitchBody}
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Capabilities
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            What {content.displayName} handles
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {content.features.map((feature, index) => {
            const Icon = ICON_MAP[feature.icon]
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border-neutral-200/80 bg-white p-6 shadow-none transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
              >
                <div
                  className={cn(
                    "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity group-hover:opacity-100 dark:hidden",
                    glow,
                  )}
                />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${content.accent}18` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: content.accent }} />
                    </div>
                    <span className="text-[10px] font-semibold tabular-nums text-neutral-300 dark:text-neutral-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-neutral-950 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {feature.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mt-12 space-y-8">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            How it works
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            {content.stepsTitle}
          </h2>
          <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400 sm:text-lg">
            {content.stepsSubtitle}
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <ChatDemoPreview agent={agent} content={content} activeStep={activeStep} />

          <div className="space-y-3">
            <div className="flex gap-1.5">
              {content.steps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to step ${index + 1}`}
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    activeStep === index
                      ? "bg-neutral-900 dark:bg-white"
                      : "bg-neutral-200 dark:bg-neutral-700",
                  )}
                  style={
                    activeStep === index
                      ? { backgroundColor: content.accent }
                      : undefined
                  }
                />
              ))}
            </div>

            <div className="divide-y divide-neutral-200 rounded-[1.5rem] border border-neutral-200/80 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
              {content.steps.map((step, index) => {
                const isActive = activeStep === index
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      "w-full px-6 py-5 text-left transition-colors sm:px-8",
                      isActive
                        ? "bg-neutral-50 dark:bg-neutral-800/60"
                        : "hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-colors",
                          isActive
                            ? "text-neutral-950 dark:text-neutral-950"
                            : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500",
                        )}
                        style={
                          isActive
                            ? { backgroundColor: `${content.accent}33`, color: content.accent }
                            : undefined
                        }
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={cn(
                            "text-base font-semibold sm:text-lg",
                            isActive
                              ? "text-neutral-950 dark:text-white"
                              : "text-neutral-500 dark:text-neutral-400",
                          )}
                        >
                          {step.title}
                        </h3>
                        {isActive ? (
                          <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {step.description}
                          </p>
                        ) : null}
                      </div>
                      {isActive ? (
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-neutral-400" />
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {relatedAgents.length > 0 ? (
        <section className="mt-12 space-y-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Related
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-2xl">
              More {agent.category} agents
            </h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {relatedAgents.map((related) => {
              const relatedContent = getAgentMarketingContent(related)
              return (
                <Link
                  key={related.id}
                  href={`${agentBaseHref}/${related.id}`}
                  className="flex min-w-[240px] shrink-0 items-start gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                  <AgentPortrait agent={related} className="h-12 w-10 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-950 dark:text-white">
                      {relatedContent.displayName}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">{relatedContent.roleTitle}</p>
                    <p className="mt-1.5 line-clamp-2 text-sm text-neutral-500">{related.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      <section
        className="relative mt-12 overflow-hidden rounded-[2rem] border border-neutral-200/80 px-6 py-12 text-center sm:px-10 dark:border-neutral-800"
        style={{
          background: `linear-gradient(135deg, ${content.accent}20 0%, ${content.accent}08 55%, transparent 100%)`,
        }}
      >
        {/* <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
          style={{ boxShadow: `0 0 0 1px ${content.accent}33` }}
        >
          <Sparkles className="h-5 w-5" style={{ color: content.accent }} />
        </div> */}
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
          Ready to work with {content.displayName}?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-neutral-600 dark:text-neutral-300 sm:text-lg">
          {content.pitchTagline}
        </p>
        <div className="mt-8 flex justify-center">
          <ActionButtons {...actionProps} className="justify-center" />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95 lg:hidden">
        <ActionButtons {...actionProps} className="w-full [&_button]:flex-1 [&_a]:flex-1" size="default" />
      </div>
    </div>
  )
}

function AgentBadges({
  agent,
  isInstalled,
  featureCount,
}: {
  agent: (typeof AI_AGENTS_CATALOG)[number]
  isInstalled: boolean
  featureCount: number
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">
        {agent.category}
      </span>
      <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
        {featureCount} capabilities
      </span>
      {isInstalled ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#c1ff72] px-3 py-1 text-xs font-semibold text-neutral-950">
          <Check className="h-3.5 w-3.5" />
          Enabled
        </span>
      ) : agentHasLiveTools(agent.id) ? (
        <span className="rounded-full bg-[#c1ff72]/20 px-3 py-1 text-xs font-semibold text-[#4a7a18] dark:text-[#c1ff72]">
          Live data
        </span>
      ) : null}
    </div>
  )
}
