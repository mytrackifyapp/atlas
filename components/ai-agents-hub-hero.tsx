"use client"

import { useRef, useState } from "react"
import {
  AudioLines,
  Briefcase,
  FileText,
  Loader2,
  Mic,
  Plus,
  Trophy,
  Wallet,
} from "lucide-react"

import {
  AGENT_CATEGORIES,
  type AgentCategory,
} from "@/lib/ai-agents-catalog"
import { QuickFeatureCard } from "@/components/agents/quick-feature-card"
import { FinnaOrb } from "@/components/finna-orb"
import { FinnaVoiceBeam } from "@/components/finna-voice-beam"
import { useFinnaVoice } from "@/hooks/use-finna-voice"
import { getFinnaIntro, getFinnaTagline } from "@/lib/finna-suggestions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FOUNDER_FEATURES = [
  {
    title: "Legal",
    features: ["Review NDAs", "Draft contractor agreements", "Flag compliance risks"],
    glow: "from-violet-500/35 via-fuchsia-500/15 to-transparent",
    iconSrc: "/lawyer2.png",
    prompt: "Help me review an NDA and flag any risky clauses for my startup",
  },
  {
    title: "Finance",
    features: ["Analyze runway", "Explain burn", "Prep investor updates"],
    glow: "from-emerald-500/35 via-green-500/15 to-transparent",
    iconSrc: "/cfo.png",
    prompt: "Analyze my runway and tell me what changed in expenses",
  },
  {
    title: "Sales",
    features: ["Write cold outreach", "Prioritize pipeline", "Handle objections"],
    glow: "from-sky-500/35 via-blue-500/15 to-transparent",
    iconSrc: "/sales.png",
    prompt: "What's in my sales pipeline and who needs a follow-up?",
  },
  {
    title: "Marketing",
    features: ["Draft social posts", "Plan launch campaigns", "Sharpen positioning"],
    glow: "from-rose-500/35 via-pink-500/15 to-transparent",
    iconSrc: "/ops.png",
    prompt: "Help me plan this week's social content and launch messaging",
  },
  {
    title: "Operations",
    features: ["Build weekly SOPs", "Set team priorities", "Unblock vendors"],
    glow: "from-amber-500/35 via-orange-500/15 to-transparent",
    iconSrc: "/marketer.png",
    prompt: "Help me plan this week's team priorities and draft a simple SOP",
  },
  {
    title: "People",
    features: ["Write job descriptions", "Prep interview kits", "Onboard new hires"],
    glow: "from-cyan-500/35 via-teal-500/15 to-transparent",
    iconSrc: "/lawyer.png",
    prompt: "Write a job description and interview kit for my next hire",
  },
] as const

const INVESTOR_FEATURES = [
  {
    title: "Deal flow",
    features: ["Summarize the pipeline", "Flag stale deals", "Prep next meetings"],
    glow: "from-sky-500/35 via-blue-500/15 to-transparent",
    icon: Briefcase,
    prompt: "Summarize my deal flow and which deals need attention",
  },
  {
    title: "Finance",
    features: ["Cash position", "Recent spend", "Workspace balances"],
    glow: "from-emerald-500/35 via-green-500/15 to-transparent",
    icon: Wallet,
    prompt: "What's my cash position and what changed recently?",
  },
  {
    title: "Diligence",
    features: ["Pull workspace notes", "Issue-spot a startup", "Prep IC questions"],
    glow: "from-violet-500/35 via-fuchsia-500/15 to-transparent",
    icon: FileText,
    prompt: "Help me diligence the next startup in my pipeline using my notes",
  },
  {
    title: "Portfolio",
    features: ["Track updates", "Compare performance", "Plan follow-ons"],
    glow: "from-amber-500/35 via-orange-500/15 to-transparent",
    icon: Trophy,
    prompt: "How do I use the portfolio dashboard to see what needs attention?",
  },
] as const

type Props = {
  activeCategory: AgentCategory | "All"
  onCategoryChange: (category: AgentCategory | "All") => void
  viewerRole?: "founder" | "investor" | null
  onSearch?: (query: string) => void
  onAsk: (prompt: string) => void
}

export function AiAgentsHubHero({
  activeCategory,
  onCategoryChange,
  viewerRole,
  onSearch,
  onAsk,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const isInvestor = viewerRole === "investor"
  const tagline = getFinnaTagline(viewerRole ?? "founder")
  const intro = getFinnaIntro(viewerRole ?? "founder")
  const features = isInvestor ? INVESTOR_FEATURES : FOUNDER_FEATURES
  const categories = (
    isInvestor ? (["All", "Legal", "Finance", "Operations"] as const) : (["All", ...AGENT_CATEGORIES] as const)
  )

  const voice = useFinnaVoice({
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

  function goToFinna(prompt: string) {
    onAsk(prompt)
  }

  async function handleSubmit() {
    const text = input.trim()
    if (!text || submitting) return
    setSubmitting(true)
    try {
      goToFinna(text)
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
            <FinnaOrb thinking={submitting} size={64} />
            <div className="text-left">
              <h2 className="text-xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-2xl">
                Finna
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {tagline}
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {intro}
          </p>

          <div className="mt-8 w-full">
            <FinnaVoiceBeam
              stream={voice.listening ? voice.stream : null}
              processing={submitting}
              theme="light"
            >
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
                    voice.listening
                      ? "Listening…"
                      : isInvestor
                        ? "Ask Finna about deal flow, cash, or a startup in your pipeline…"
                        : "Ask Finna about runway, fundraising, sales, or anything in the business…"
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
                    {voice.supported ? (
                      <button
                        type="button"
                        onClick={() => void voice.toggle()}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                          voice.listening
                            ? "border-red-500/50 bg-red-500/10 text-red-500 dark:text-red-400"
                            : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white",
                        )}
                        aria-label={voice.listening ? "Stop listening" : "Voice input"}
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
                        <AudioLines className="h-4 w-4" strokeWidth={2.25} />
                      )}
                    </Button>
                  </div>
                </div>

                {voice.error ? (
                  <p className="mt-2 text-xs text-destructive">{voice.error}</p>
                ) : null}
                </div>
              </div>
            </FinnaVoiceBeam>
          </div>
        </div>
      </div>

      <div className="relative mt-8 w-full sm:mt-10">
        <div
          className={cn(
            "grid gap-2.5",
            isInvestor ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
          )}
        >
          {features.map((feature) => (
            <QuickFeatureCard
              key={feature.title}
              title={feature.title}
              features={feature.features}
              glow={feature.glow}
              iconSrc={"iconSrc" in feature ? feature.iconSrc : undefined}
              icon={"icon" in feature ? feature.icon : undefined}
              onClick={() => goToFinna(feature.prompt)}
            />
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div className="mt-10 flex w-full gap-2 overflow-x-auto pb-1 sm:mt-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center">
          {categories.map((category) => {
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
      </div>
    </section>
  )
}
