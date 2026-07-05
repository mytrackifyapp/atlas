"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, AudioLines, Mic, PanelRight, Plus, ShieldAlert, UserRound } from "lucide-react"
import { toast } from "sonner"

import type { AgentChatMessage } from "@/lib/agents/types"
import { ChatMessageText } from "@/components/chat-message-text"
import { AgentChatSidebar } from "@/components/agents/agent-chat-sidebar"
import { AiCreditsBadge } from "@/components/ai-credits-badge"
import { MarketerSocialCta } from "@/components/marketer-social-cta"
import { AI_AGENTS_CATALOG, resolveAgentId } from "@/lib/ai-agents-catalog"
import {
  assistantMentionsSocialDraft,
  isSocialDesignRequest,
  isVagueSocialDesignRequest,
  SOCIAL_DRAFTS_PATH,
} from "@/lib/social/marketer-chat-intent"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useVoiceInput } from "@/hooks/use-voice-input"
import {
  isLikelyLongRunningTask,
  registerAgentTaskRun,
  useAgentTaskNotifications,
} from "@/hooks/use-agent-task-notifications"

type Props = {
  agentId: string
}

type DisplayMessage = AgentChatMessage & { id?: string }

type SalesLeadContext = {
  id: string
  name: string
  company: string
  email?: string
  stage: string
}

async function readApiError(res: Response, fallback: string) {
  const text = await res.text().catch(() => "")
  try {
    const json = JSON.parse(text) as { error?: string }
    return json.error || fallback
  } catch {
    return text || fallback
  }
}

function timeGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function ChatComposer({
  input,
  onInputChange,
  onSend,
  busy,
  loadingHistory,
  conversationId,
  voiceInput,
  onMicPress,
  className,
}: {
  input: string
  onInputChange: (value: string) => void
  onSend: () => void
  busy: boolean
  loadingHistory: boolean
  conversationId: string | null
  voiceInput: ReturnType<typeof useVoiceInput>
  onMicPress: () => void
  className?: string
}) {
  const disabled = busy || loadingHistory || !conversationId
  const expanded = hasContent(input)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "flex items-end gap-0.5 px-2 py-2 shadow-sm",
          "border border-neutral-200 bg-white dark:border-transparent dark:bg-neutral-800",
          expanded ? "rounded-[1.75rem]" : "rounded-full",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mb-0.5 h-9 w-9 shrink-0 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
          disabled={disabled}
          onClick={() => inputRef.current?.focus()}
          title="New message"
        >
          <Plus className="h-5 w-5" strokeWidth={1.75} />
        </Button>

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          rows={expanded ? 3 : 1}
          placeholder={voiceInput.isListening ? "Listening…" : "Ask anything"}
          disabled={disabled}
          className="max-h-32 min-h-[2.25rem] flex-1 resize-none bg-transparent px-1 py-2 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
        />

        <div className="mb-0.5 flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white",
              voiceInput.isListening &&
                "bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-white",
            )}
            disabled={!voiceInput.supported || disabled}
            onClick={onMicPress}
            title={voiceInput.isListening ? "Stop listening" : "Use voice"}
          >
            <Mic className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            size="icon"
            className="h-10 w-10 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
            disabled={disabled || !input.trim()}
            onClick={onSend}
            title="Send message"
          >
            <AudioLines className="h-4 w-4" strokeWidth={2.25} />
          </Button>
        </div>
      </div>

      {voiceInput.displayTranscript ? (
        <p className="mt-2 text-center text-xs text-neutral-500">{voiceInput.displayTranscript}</p>
      ) : null}
      {voiceInput.error ? (
        <p className="mt-2 text-center text-xs text-destructive">{voiceInput.error}</p>
      ) : null}
    </div>
  )
}

function hasContent(value: string) {
  return value.trim().length > 0 || value.includes("\n")
}

export function AgentChatView({ agentId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const leadParam = searchParams.get("lead")
  const resolvedAgentId = resolveAgentId(agentId)
  const agent = useMemo(
    () => AI_AGENTS_CATALOG.find((a) => a.id === resolvedAgentId),
    [resolvedAgentId],
  )
  const agentBaseHref = pathname.startsWith("/founder") ? "/founder/ai" : "/dashboard/ai"
  const detailHref = `${agentBaseHref}/${resolvedAgentId}`
  const greeting = useMemo(() => {
    if (agentId === "ai-marketer") {
      return agent
        ? `I'm ${agent.name}. Tell me the platform and topic for your next post or design.`
        : "Tell me what marketing content or design you need."
    }
    return agent
      ? `I'm ${agent.name}. What are you working on today?`
      : "What are you working on today?"
  }, [agent, agentId])

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [salesLeadContext, setSalesLeadContext] = useState<SalesLeadContext | null>(null)
  const [switchingConversation, setSwitchingConversation] = useState(false)
  const [socialCtaVariant, setSocialCtaVariant] = useState<"generating" | "ready" | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const socialGeneratingRef = useRef(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const streamAbortRef = useRef<AbortController | null>(null)
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => {})
  const pendingPromptRef = useRef<string | null>(null)
  const sendInFlightRef = useRef(false)
  const assistantIdxRef = useRef(-1)
  const stopListeningRef = useRef<() => void>(() => {})

  const isMarketer = agentId === "ai-marketer"
  const hasUserMessages = messages.some((m) => m.role === "user")

  const loadConversationById = useCallback(async (id: string) => {
    setSwitchingConversation(true)
    setError(null)
    try {
      const res = await fetch(`/api/agents/conversations/${id}`)
      if (!res.ok) throw new Error(await readApiError(res, "Failed to load chat"))
      const data = (await res.json()) as {
        conversation: { id: string }
        messages: Array<{ role: "user" | "assistant"; content: string; id?: string }>
      }
      setConversationId(data.conversation.id)
      setMessages(
        data.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content, id: m.id })),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load chat")
    } finally {
      setSwitchingConversation(false)
    }
  }, [])

  const startNewChat = useCallback(async () => {
    setSwitchingConversation(true)
    setError(null)
    try {
      const res = await fetch("/api/agents/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      })
      if (!res.ok) throw new Error(await readApiError(res, "Failed to start new chat"))
      const data = (await res.json()) as { conversation: { id: string } }
      setConversationId(data.conversation.id)
      setMessages([])
      setInput("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start new chat")
    } finally {
      setSwitchingConversation(false)
    }
  }, [agentId])

  function notifySocialDraftReady() {
    setSocialCtaVariant("ready")
    toast.success("Your content is ready", {
      description: "Preview your graphic and caption on the Social page.",
      action: {
        label: "View drafts",
        onClick: () => router.push(SOCIAL_DRAFTS_PATH),
      },
      duration: 12000,
    })
  }

  function handleMarketerDesignSend(trimmed: string) {
    if (!isMarketer || !isSocialDesignRequest(trimmed)) return

    if (isVagueSocialDesignRequest(trimmed)) {
      toast.message("Quick details help me design better", {
        description:
          "I'll ask about platform and topic — or say “LinkedIn launch post” to skip ahead.",
        duration: 8000,
      })
      return
    }

    setSocialCtaVariant("generating")
    socialGeneratingRef.current = true
    toast.info("Your content is generating…", {
      description: "Branded caption + PNG in progress. Open Social anytime to check.",
      action: {
        label: "Open Social",
        onClick: () => router.push(SOCIAL_DRAFTS_PATH),
      },
      duration: 10000,
    })
  }

  function handleMarketerDesignComplete(trimmedUserMessage: string, assistantText: string) {
    if (!isMarketer) return

    if (isVagueSocialDesignRequest(trimmedUserMessage)) {
      socialGeneratingRef.current = false
      setSocialCtaVariant(null)
      return
    }

    if (assistantMentionsSocialDraft(assistantText)) {
      socialGeneratingRef.current = false
      notifySocialDraftReady()
      return
    }

    if (
      socialGeneratingRef.current &&
      isSocialDesignRequest(trimmedUserMessage) &&
      !isVagueSocialDesignRequest(trimmedUserMessage)
    ) {
      socialGeneratingRef.current = false
      setSocialCtaVariant(null)
    }
  }

  useEffect(() => {
    if (searchParams.get("social") === "ready") {
      setSocialCtaVariant("ready")
    }
  }, [searchParams])

  useEffect(() => {
    const prompt = searchParams.get("prompt")?.trim()
    if (prompt) pendingPromptRef.current = prompt
  }, [searchParams])

  useEffect(() => {
    if (!conversationId || loadingHistory || !pendingPromptRef.current) return

    const prompt = pendingPromptRef.current
    pendingPromptRef.current = null

    const url = new URL(window.location.href)
    url.searchParams.delete("prompt")
    router.replace(`${url.pathname}${url.search}`, { scroll: false })

    void sendMessageRef.current(prompt)
  }, [conversationId, loadingHistory, router])

  useEffect(() => {
    if (agentId !== "ai-sales-rep" || !leadParam) {
      setSalesLeadContext(null)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/sales/leads/${leadParam}`, { cache: "no-store" })
        const data = await res.json()
        if (cancelled || !res.ok || !data.lead) return
        setSalesLeadContext({
          id: data.lead.id,
          name: data.lead.name,
          company: data.lead.company,
          email: data.lead.email,
          stage: data.lead.stage,
        })
      } catch {
        if (!cancelled) setSalesLeadContext(null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [agentId, leadParam])

  useEffect(() => {
    let cancelled = false
    fetch("/api/agents/approvals?status=pending", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        const count = (data.approvals ?? []).filter(
          (a: { agentId: string }) => resolveAgentId(a.agentId) === resolvedAgentId,
        ).length
        setPendingApprovals(count)
      })
      .catch(() => {
        if (!cancelled) setPendingApprovals(0)
      })
    return () => {
      cancelled = true
    }
  }, [resolvedAgentId, conversationId])

  const reloadConversation = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/agents/conversations?agentId=${encodeURIComponent(agentId)}&latest=true`,
      )
      if (!res.ok) return
      const data = (await res.json()) as {
        conversation: { id: string }
        messages: Array<{ role: "user" | "assistant"; content: string; id?: string }>
      }
      setConversationId(data.conversation.id)
      if (data.messages.length > 0) {
        setMessages(
          data.messages.map((m) => ({
            role: m.role,
            content: m.content,
            id: m.id,
          })),
        )
      }
    } catch {
      // ignore reload errors
    }
  }, [agentId])

  useAgentTaskNotifications({
    agentId,
    conversationId,
    enabled: Boolean(conversationId),
    onTaskComplete: () => {
      void reloadConversation()
    },
  })

  useEffect(() => {
    let cancelled = false

    async function loadConversation() {
      setLoadingHistory(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/agents/conversations?agentId=${encodeURIComponent(agentId)}&latest=true`,
        )
        if (!res.ok) {
          throw new Error(await readApiError(res, "Failed to load conversation"))
        }
        const data = (await res.json()) as {
          conversation: { id: string }
          messages: Array<{ role: "user" | "assistant"; content: string; id?: string }>
        }
        if (cancelled) return

        setConversationId(data.conversation.id)
        setMessages(
          data.messages.length > 0
            ? data.messages.map((m) => ({
                role: m.role,
                content: m.content,
                id: m.id,
              }))
            : [],
        )
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load conversation")
        }
      } finally {
        if (!cancelled) setLoadingHistory(false)
      }
    }

    loadConversation()
    return () => {
      cancelled = true
    }
  }, [agentId])

  function scrollToBottom() {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  const queueMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || !conversationId || sendInFlightRef.current) return

      stopListeningRef.current()
      sendInFlightRef.current = true
      setError(null)
      setInput("")

      const userMessage: DisplayMessage = { role: "user", content: trimmed }
      const ackMessage: DisplayMessage = {
        role: "assistant",
        content: "Working on this in the background — I'll notify you when it's ready.",
      }

      setMessages((prev) => [...prev, userMessage, ackMessage])
      queueMicrotask(scrollToBottom)

      try {
        const res = await fetch("/api/agents/chat/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId,
            conversationId,
            message: trimmed,
            salesLeadContext: salesLeadContext ?? undefined,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to queue task")

        registerAgentTaskRun(data.run.id)
        toast.info("Working in the background", {
          description: `${agent?.name ?? "Your agent"} will notify you when this is ready.`,
          duration: 8000,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to queue task")
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        sendInFlightRef.current = false
      }
    },
    [agentId, conversationId, salesLeadContext, agent?.name],
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || !conversationId || sendInFlightRef.current) return

      stopListeningRef.current()
      sendInFlightRef.current = true
      setBusy(true)
      setError(null)
      setInput("")

      const userMessage: DisplayMessage = { role: "user", content: trimmed }
      setMessages((prev) => {
        assistantIdxRef.current = prev.length + 1
        return [...prev, userMessage, { role: "assistant", content: "" }]
      })
      queueMicrotask(scrollToBottom)

      handleMarketerDesignSend(trimmed)

      try {
        streamAbortRef.current?.abort()
        const aborter = new AbortController()
        streamAbortRef.current = aborter

        const res = await fetch("/api/agents/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId,
            conversationId,
            message: trimmed,
            salesLeadContext: salesLeadContext ?? undefined,
          }),
          signal: aborter.signal,
        })

        if (!res.ok || !res.body) {
          throw new Error(await readApiError(res, "Failed to chat"))
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let full = ""

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          if (!chunk) continue
          full += chunk

          const assistantIdx = assistantIdxRef.current
          setMessages((prev) => {
            if (assistantIdx < 0 || assistantIdx >= prev.length) return prev
            const copy = [...prev]
            const cur = copy[assistantIdx]
            if (!cur || cur.role !== "assistant") return prev
            copy[assistantIdx] = { ...cur, content: full }
            return copy
          })
          queueMicrotask(scrollToBottom)
        }

        handleMarketerDesignComplete(trimmed, full)
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError(e instanceof Error ? e.message : "Failed to chat")
          const failedIdx = assistantIdxRef.current
          setMessages((prev) => prev.filter((_, idx) => idx !== failedIdx))
        }
      } finally {
        sendInFlightRef.current = false
        setBusy(false)
      }
    },
    [agentId, conversationId, salesLeadContext],
  )

  useEffect(() => {
    sendMessageRef.current = async (text: string) => {
      if (isLikelyLongRunningTask(text)) {
        await queueMessage(text)
        return
      }
      await sendMessage(text)
    }
  }, [sendMessage, queueMessage])

  const voiceInput = useVoiceInput({
    onFinalTranscript: (text) => {
      void sendMessageRef.current(text)
    },
  })

  stopListeningRef.current = voiceInput.stopListening

  function send() {
    const trimmed = input.trim()
    if (!trimmed) return
    if (isLikelyLongRunningTask(trimmed)) {
      void queueMessage(trimmed)
      return
    }
    void sendMessage(input)
  }

  function handleMicPress() {
    if (busy) return
    if (voiceInput.isListening) {
      voiceInput.stopListening()
      return
    }
    voiceInput.startListening()
  }

  function runToolPrompt(prompt: string) {
    setSidebarOpen(false)
    void sendMessageRef.current(prompt)
  }

  function handleSelectConversation(id: string) {
    setSidebarOpen(false)
    void loadConversationById(id)
  }

  function handleNewChat() {
    setSidebarOpen(false)
    startNewChat()
  }

  const sidebarProps = {
    agentId,
    agentBaseHref,
    conversationId,
    onSelectConversation: handleSelectConversation,
    onNewChat: handleNewChat,
    onRunTool: runToolPrompt,
    switchingConversation,
  }

  const statusBanners = (
    <>
      {salesLeadContext ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          <UserRound className="h-3.5 w-3.5 shrink-0" />
          <span>
            Working with <strong>{salesLeadContext.name}</strong> @ {salesLeadContext.company}
          </span>
        </div>
      ) : null}
      {isMarketer && socialCtaVariant ? (
        <div className="mb-4">
          <MarketerSocialCta variant={socialCtaVariant} />
        </div>
      ) : null}
      {error ? <p className="mb-4 text-center text-xs text-destructive">{error}</p> : null}
    </>
  )

  const mainChat = (
    <>
      {!hasUserMessages && !loadingHistory ? (
        <div className="flex flex-1 flex-col items-center justify-center px-2">
          <div className="w-full max-w-2xl text-center">
            <p className="text-sm text-neutral-500">{timeGreeting()}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
              What can I help you with today?
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-neutral-500">
              {greeting}
            </p>
          </div>

          <div className="mt-10 w-full max-w-2xl">
            {statusBanners}
            <ChatComposer
              input={input}
              onInputChange={setInput}
              onSend={send}
              busy={busy}
              loadingHistory={loadingHistory}
              conversationId={conversationId}
              voiceInput={voiceInput}
              onMicPress={handleMicPress}
            />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-4"
          >
            {loadingHistory || switchingConversation ? (
              <p className="text-center text-sm text-neutral-500">Loading conversation…</p>
            ) : null}
            {!loadingHistory && !hasUserMessages ? (
              <p className="text-center text-sm text-neutral-500">{greeting}</p>
            ) : null}
            {messages.map((m, idx) => (
              <div
                key={m.id ?? idx}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
                  )}
                >
                  {m.role === "assistant" ? (
                    <ChatMessageText content={m.content} />
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {busy ? (
              <p className="text-sm text-neutral-500">Thinking…</p>
            ) : null}
          </div>

          <div className="shrink-0 bg-transparent pt-4">
            {statusBanners}
            <ChatComposer
              input={input}
              onInputChange={setInput}
              onSend={send}
              busy={busy}
              loadingHistory={loadingHistory}
              conversationId={conversationId}
              voiceInput={voiceInput}
              onMicPress={handleMicPress}
            />
          </div>
        </div>
      )}
    </>
  )

  const inConversation = hasUserMessages || loadingHistory || switchingConversation

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl",
        inConversation && "lg:flex lg:h-[calc(100dvh-7rem)] lg:max-h-[calc(100dvh-7rem)] lg:flex-col",
      )}
    >
      <header
        className={cn(
          "mb-6 flex shrink-0 items-center justify-between gap-4",
          "max-lg:sticky max-lg:top-[3.5rem] max-lg:z-20 max-lg:-mx-3 max-lg:mb-4 max-lg:border-b max-lg:border-neutral-200/80 max-lg:bg-[#f4f4f5]/95 max-lg:px-3 max-lg:py-3 max-lg:backdrop-blur-sm",
          "dark:max-lg:border-neutral-800 dark:max-lg:bg-neutral-950/95",
        )}
      >
        <div className="flex items-center gap-3">
          <Link
            href={detailHref}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:text-neutral-900 dark:border-neutral-800 dark:hover:text-white"
            aria-label={`Back to ${agent?.name ?? "agent"}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-sm font-medium text-neutral-950 dark:text-white">
              {agent?.name ?? "AI Agent"}
            </p>
            <p className="text-xs text-neutral-500">{agent?.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AiCreditsBadge compact className="hidden sm:inline-flex" />
          <Link
            href={`${agentBaseHref}/approvals`}
            className="relative inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-200 px-3 text-xs font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-white"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Approvals
            {pendingApprovals > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-semibold leading-none text-white">
                {pendingApprovals > 9 ? "9+" : pendingApprovals}
              </span>
            ) : null}
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open chat options"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
          <Link
            href={detailHref}
            className="hidden text-xs text-neutral-500 transition-colors hover:text-neutral-900 lg:inline dark:hover:text-white"
          >
            About this agent
          </Link>
        </div>
      </header>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[min(320px,92vw)] gap-0 p-0 sm:max-w-[320px]">
          <SheetTitle className="sr-only">Chat options</SheetTitle>
          <SheetDescription className="sr-only">
            History, setup, and tools for this agent
          </SheetDescription>
          <AgentChatSidebar {...sidebarProps} className="h-full max-h-none rounded-none border-0" />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start xl:grid-cols-[minmax(0,1fr)_320px]",
          inConversation && "lg:min-h-0 lg:flex-1",
        )}
      >
        <div
          className={cn(
            "min-w-0",
            inConversation && "flex min-h-0 flex-col lg:h-full",
          )}
        >
          {mainChat}
        </div>

        <div className="hidden lg:sticky lg:top-0 lg:block lg:self-start">
          <AgentChatSidebar {...sidebarProps} />
        </div>
      </div>
    </div>
  )
}
