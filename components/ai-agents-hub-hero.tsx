"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AudioLines, FileText, Loader2, Mic, Plus, Sparkles, Trophy, Users } from "lucide-react"

import {
  AGENT_CATEGORIES,
  type AgentCategory,
} from "@/lib/ai-agents-catalog"
import { getAgentChatHref, suggestAgentForTask } from "@/lib/agent-task-routing"
import { QuickFeatureCard } from "@/components/agents/quick-feature-card"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ComposerMode = "ask" | "agents"

const ASK_FEATURES = [
  {
    icon: Sparkles,
    title: "Learn Trackify",
    description: "Explain core features",
    prompt: "What is Trackify and what can it do?",
  },
  {
    icon: Trophy,
    title: "Optimize Workflow",
    description: "Prioritize pending items",
    prompt: "Help me prioritize what to work on next in my workspace",
  },
  {
    icon: FileText,
    title: "Setup Summary",
    description: "Summarize onboarding progress",
    prompt: "Summarize my setup and what I should do next to get started",
  },
  {
    icon: Sparkles,
    title: "Founder Dashboard",
    description: "Explore workspace tools",
    prompt: "What can the founder dashboard do?",
  },
] as const

const QUICK_FEATURES = [
  {
    agentId: "ai-lawyer",
    title: "Legal",
    features: ["Review NDAs", "Draft contractor agreements", "Flag compliance risks"],
    superpowers: "12+ Superpowers",
    glow: "from-violet-500/35 via-fuchsia-500/15 to-transparent",
    iconSrc: "/lawyer2.png",
    prompt: "Help me review an NDA and flag any risky clauses for my startup",
  },
  {
    agentId: "ai-cfo",
    title: "Finance",
    features: ["Raise funds", "Model runway & burn", "Draft investor updates"],
    superpowers: "10+ Superpowers",
    glow: "from-emerald-500/35 via-green-500/15 to-transparent",
    iconSrc: "/cfo.png",
    prompt: "Help me raise funds and prepare for my next investor conversation",
  },
  {
    agentId: "ai-sales-rep",
    title: "Sales",
    features: ["Write cold outreach", "Prioritize pipeline deals", "Handle objections"],
    superpowers: "8+ Superpowers",
    glow: "from-sky-500/35 via-blue-500/15 to-transparent",
    iconSrc: "/sales.png",
    prompt: "Write a personalized cold outreach email for a B2B prospect in my pipeline",
  },
  {
    agentId: "ai-marketer",
    title: "Marketing",
    features: ["Design TikTok posts", "Schedule IG content", "Plan launch campaigns"],
    superpowers: "9+ Superpowers",
    glow: "from-rose-500/35 via-pink-500/15 to-transparent",
    iconSrc: "/marketer.png",
    prompt: "Design and schedule a TikTok post and Instagram post for this week's launch",
  },
  {
    agentId: "ai-ops-manager",
    title: "Operations",
    features: ["Build weekly SOPs", "Compare vendor quotes", "Plan team priorities"],
    superpowers: "7+ Superpowers",
    glow: "from-amber-500/35 via-orange-500/15 to-transparent",
    iconSrc: "/ops.png",
    prompt: "Help me plan this week's team priorities and draft a simple SOP",
  },
  {
    agentId: "ai-hr",
    title: "HR",
    features: ["Write job descriptions", "Prep interview kits", "Onboard new hires"],
    superpowers: "6+ Superpowers",
    glow: "from-cyan-500/35 via-teal-500/15 to-transparent",
    iconSrc: "/lawyer.png",
    prompt: "Write a job description and interview kit for my next hire",
  },
] as const

type Props = {
  agentBaseHref: string
  activeCategory: AgentCategory | "All"
  onCategoryChange: (category: AgentCategory | "All") => void
  installedSet: Set<string>
  onSearch?: (query: string) => void
}

export function AiAgentsHubHero({
  agentBaseHref,
  activeCategory,
  onCategoryChange,
  installedSet,
  onSearch,
}: Props) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [mode, setMode] = useState<ComposerMode>("agents")
  const [input, setInput] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const voiceInput = useVoiceInput({
    onFinalTranscript: (text) => {
      setInput((prev) => (prev ? `${prev.trim()} ${text}` : text))
    },
  })

  function resizeComposer() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  async function handleSubmit() {
    const text = input.trim()
    if (!text || submitting) return

    setSubmitting(true)
    try {
      if (mode === "ask") {
        router.push(`/finna?q=${encodeURIComponent(text)}`)
        return
      }

      const agentId = suggestAgentForTask(text, installedSet)
      router.push(getAgentChatHref(agentBaseHref, agentId, text))
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  return (
    <section className="relative -mx-3 -mt-3 overflow-visible px-4 pb-10 pt-14 sm:px-8 sm:pb-14 sm:pt-16 lg:-mx-6 lg:-mt-6 lg:pt-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden dark:hidden">
        <div className="absolute -left-[22%] -top-[55%] h-[min(36rem,80vw)] w-[min(36rem,80vw)] rounded-full bg-[#4483f2]/[0.09] blur-[120px]" />
        <div className="absolute -right-[18%] -top-[50%] h-[min(34rem,75vw)] w-[min(34rem,75vw)] rounded-full bg-violet-400/[0.1] blur-[130px]" />
        <div className="absolute -top-[45%] left-1/2 h-[min(30rem,70vw)] w-[min(50rem,110vw)] -translate-x-1/2 rounded-full bg-violet-200/[0.12] blur-[140px]" />
        <div className="absolute -bottom-[30%] -right-[8%] h-[min(26rem,55vw)] w-[min(26rem,55vw)] rounded-full bg-rose-300/[0.12] blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[min(20rem,45vw)] w-[min(20rem,45vw)] rounded-full bg-sky-300/[0.08] blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#f4f4f5_0%,rgba(244,244,245,0.92)_12%,rgba(244,244,245,0.65)_35%,#f4f4f5_100%)]" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#f4f4f5] via-[#f4f4f5]/70 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl">
              <Image
                src="/orb.jpeg"
                alt="Super Team"
                fill
                className="object-cover"
                sizes="36px"
                priority
              />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-2xl">
              Super Team
            </h2>
          </div>

          <div className="mt-8 w-full">
            <div className="mb-3 hidden justify-center">
              <div
                className="inline-flex rounded-full border border-neutral-200/80 bg-white/70 p-0.5 dark:border-neutral-800 dark:bg-neutral-900/70"
                role="tablist"
                aria-label="Composer mode"
              >
                {(
                  [
                    { id: "ask" as const, label: "Ask", icon: Sparkles },
                    { id: "agents" as const, label: "Agents", icon: Users },
                  ] as const
                ).map(({ id, label, icon: Icon }) => {
                  const active = mode === id
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setMode(id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm",
                        active
                          ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                          : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#4483f2]/25 via-[#f4f4f5]/80 to-rose-300/20 p-[1px] dark:from-[#4483f2]/45 dark:via-neutral-800/40 dark:to-rose-500/25">
              <div className="rounded-2xl border border-neutral-200/80 bg-white/90 px-4 pb-3 pt-4 backdrop-blur-sm dark:border-neutral-800/80 dark:bg-neutral-900/90 sm:px-5 sm:pb-4 sm:pt-5">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    resizeComposer()
                  }}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder={
                    mode === "ask"
                      ? "Ask Finna anything about Trackify, your workspace, or next steps…"
                      : "Describe tasks or workflows that need automating…"
                  }
                  className="min-h-[3.5rem] w-full resize-none bg-transparent text-left text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white dark:placeholder:text-neutral-500 sm:text-base"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white"
                    aria-label="Add attachment"
                  >
                    <Plus className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {voiceInput.supported ? (
                      <button
                        type="button"
                        onClick={() =>
                          voiceInput.state === "listening"
                            ? voiceInput.stopListening()
                            : voiceInput.startListening()
                        }
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                          voiceInput.state === "listening"
                            ? "border-red-500/50 bg-red-500/10 text-red-500 dark:text-red-400"
                            : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white",
                        )}
                        aria-label="Voice input"
                      >
                        <Mic className="h-4 w-4" />
                      </button>
                    ) : null}

                    <Button
                      type="button"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
                      disabled={!input.trim() || submitting}
                      onClick={() => void handleSubmit()}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <AudioLines className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {voiceInput.error ? (
                  <p className="mt-2 text-xs text-destructive">{voiceInput.error}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-8 w-full sm:mt-10">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {mode === "ask"
            ? ASK_FEATURES.map(({ icon: Icon, title, description, prompt }) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => router.push(`/finna?q=${encodeURIComponent(prompt)}`)}
                  className="flex min-h-[9.5rem] w-full flex-col rounded-xl border border-neutral-200/70 bg-white/70 px-3 py-3 text-left backdrop-blur-sm transition-colors hover:border-neutral-300/80 hover:bg-white/90 dark:border-neutral-800/70 dark:bg-neutral-900/50 dark:hover:border-neutral-700 dark:hover:bg-neutral-900/70"
                >
                  <Icon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" strokeWidth={2} />
                  <span className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">
                    {title}
                  </span>
                  <span className="mt-1 line-clamp-2 text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
                    {description}
                  </span>
                </button>
              ))
            : QUICK_FEATURES.map((feature) => (
                <QuickFeatureCard
                  key={feature.agentId}
                  title={feature.title}
                  features={feature.features}
                  superpowers={feature.superpowers}
                  glow={feature.glow}
                  iconSrc={feature.iconSrc}
                  onClick={() =>
                    router.push(getAgentChatHref(agentBaseHref, feature.agentId, feature.prompt))
                  }
                />
              ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center">
          {mode === "agents" ? (
            <div className="mt-10 flex w-full gap-2 overflow-x-auto pb-1 sm:mt-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center">
              {(["All", ...AGENT_CATEGORIES] as const).map((category) => {
                const active = activeCategory === category
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      onCategoryChange(category)
                      onSearch?.("")
                    }}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200",
                    )}
                  >
                    {category}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
