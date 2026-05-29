"use client"

import { useMemo, useRef, useState } from "react"
import { SendHorizonal, Sparkles } from "lucide-react"

import type { ChatMessage } from "@/app/api/chat/route"
import { ChatMessageText } from "@/components/chat-message-text"
import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { AvatarImmersiveShell } from "@/components/avatar-immersive-shell"
import { LiveAvatarPanel } from "@/components/live-avatar-panel"
import { SynthesiaPanel } from "@/components/synthesia-panel"
import { TalkingAvatar } from "@/components/talking-avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Props = {
  agentId: string
}

export function AgentChatView({ agentId }: Props) {
  const agent = useMemo(() => AI_AGENTS_CATALOG.find((a) => a.id === agentId), [agentId])
  const greeting = useMemo(
    () =>
      agent
        ? `Hi — I’m ${agent.name}. What are you working on today?`
        : "Hi — what are you working on today?",
    [agent]
  )
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: greeting,
    },
  ])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAssistantText, setLastAssistantText] = useState(greeting)
  const [speakRequest, setSpeakRequest] = useState<{ id: number; text: string } | null>(null)

  const listRef = useRef<HTMLDivElement | null>(null)
  const speakQueueRef = useRef<string[]>([])
  const speakIdRef = useRef(0)
  const streamAbortRef = useRef<AbortController | null>(null)

  function scrollToBottom() {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  function enqueueSpeech(text: string) {
    const t = text.trim()
    if (!t) return
    speakQueueRef.current.push(t)
    maybeDequeueSpeech()
  }

  function maybeDequeueSpeech() {
    if (speakRequest) return
    const next = speakQueueRef.current.shift()
    if (!next) return
    const id = ++speakIdRef.current
    setSpeakRequest({ id, text: next })
  }

  async function send() {
    const text = input.trim()
    if (!text || busy) return

    setBusy(true)
    setError(null)
    setInput("")

    const next: ChatMessage[] = [...messages, { role: "user", content: text }]
    // Create an empty assistant message we will stream into.
    const assistantIdx = next.length
    setMessages([...next, { role: "assistant", content: "" }])
    queueMicrotask(scrollToBottom)

    try {
      // Cancel any in-flight stream.
      streamAbortRef.current?.abort()
      const aborter = new AbortController()
      streamAbortRef.current = aborter

      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, messages: next }),
        signal: aborter.signal,
      })

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "")
        throw new Error(errText || "Failed to chat")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let full = ""
      let sentenceBuf = ""

      const flushSentences = () => {
        const parts = sentenceBuf.split(/(?<=[.!?])\s+/g)
        if (parts.length <= 1) return
        // Keep last partial sentence in buffer
        sentenceBuf = parts.pop() ?? ""
        for (const p of parts) enqueueSpeech(p)
      }

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        if (!chunk) continue
        full += chunk
        sentenceBuf += chunk
        flushSentences()

        setMessages((prev) => {
          if (assistantIdx >= prev.length) return prev
          const copy = [...prev]
          const cur = copy[assistantIdx]
          if (!cur || cur.role !== "assistant") return prev
          copy[assistantIdx] = { ...cur, content: full }
          return copy
        })
        setLastAssistantText(full)
        queueMicrotask(scrollToBottom)
      }

      if (sentenceBuf.trim()) enqueueSpeech(sentenceBuf)
      setMessages((prev) => prev)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to chat")
    } finally {
      setBusy(false)
    }
  }

  const hasLiveAvatar = Boolean(agent?.useLiveAvatar)
  const hasSynthesia = Boolean(agent?.useSynthesia)
  const multiAvatarTabs = hasLiveAvatar || hasSynthesia

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          AI Agent
        </div>
        <div className="text-2xl font-semibold tracking-tight">
          {agent?.name ?? "AI Agent"}
        </div>
        {agent?.description ? (
          <div className="text-sm text-muted-foreground max-w-3xl">{agent.description}</div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        <Card className="border-border/50 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border/50">
            <div className="text-sm font-medium">Conversation</div>
            <div className="text-xs text-muted-foreground">
              Ask questions, request templates, and get CFO-style answers.
            </div>
          </div>

          <div ref={listRef} className="h-[420px] overflow-auto p-4 sm:p-6 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed border",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground border-primary/20"
                      : "bg-muted/30 border-border/60"
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
              <div className="text-xs text-muted-foreground">Thinking…</div>
            ) : null}
            {error ? (
              <div className="text-xs text-destructive">{error}</div>
            ) : null}
          </div>

          <div className="p-4 sm:p-6 border-t border-border/50">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI CFO…"
                disabled={busy}
              />
              <Button type="submit" disabled={busy || !input.trim()}>
                <SendHorizonal className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </div>
        </Card>

        <div className="space-y-4">
          {multiAvatarTabs ? (
            <Tabs defaultValue="voice" className="w-full">
              <TabsList
                className={cn(
                  "grid w-full h-10 rounded-xl",
                  hasLiveAvatar && hasSynthesia && "grid-cols-3",
                  hasLiveAvatar !== hasSynthesia && "grid-cols-2"
                )}
              >
                <TabsTrigger value="voice" className="rounded-lg text-xs sm:text-sm px-1">
                  Voice (ElevenLabs)
                </TabsTrigger>
                {hasLiveAvatar ? (
                  <TabsTrigger value="live" className="rounded-lg text-xs sm:text-sm px-1">
                    LiveAvatar
                  </TabsTrigger>
                ) : null}
                {hasSynthesia ? (
                  <TabsTrigger value="synthesia" className="rounded-lg text-xs sm:text-sm px-1">
                    Synthesia
                  </TabsTrigger>
                ) : null}
              </TabsList>
              <TabsContent value="voice" className="mt-4 space-y-0 focus-visible:outline-none">
                <AvatarImmersiveShell
                  title={agent?.name ? `${agent.name} · Voice` : "Voice avatar"}
                >
                  <TalkingAvatar
                    text={lastAssistantText}
                    autoSpeak={false}
                    speakRequest={speakRequest}
                    imageSrc={agent?.imageSrc}
                    name={agent?.name}
                    onSpeakDone={() => {
                      setSpeakRequest(null)
                      queueMicrotask(maybeDequeueSpeech)
                    }}
                  />
                </AvatarImmersiveShell>
              </TabsContent>
              {hasLiveAvatar ? (
                <TabsContent value="live" className="mt-4 focus-visible:outline-none">
                  <LiveAvatarPanel
                    agentId={agentId}
                    immersiveTitle={agent?.name ? `${agent.name} · Live` : "Live avatar"}
                  />
                </TabsContent>
              ) : null}
              {hasSynthesia ? (
                <TabsContent value="synthesia" className="mt-4 focus-visible:outline-none">
                  <SynthesiaPanel
                    videoRef={agent?.synthesiaVideoId}
                    immersiveTitle={agent?.name ? `${agent.name} · Synthesia` : "Synthesia"}
                  />
                </TabsContent>
              ) : null}
            </Tabs>
          ) : (
            <AvatarImmersiveShell title={agent?.name ? `${agent.name} · Voice` : "Voice avatar"}>
              <TalkingAvatar
                text={lastAssistantText}
                autoSpeak={false}
                speakRequest={speakRequest}
                imageSrc={agent?.imageSrc}
                name={agent?.name}
                onSpeakDone={() => {
                  setSpeakRequest(null)
                  queueMicrotask(maybeDequeueSpeech)
                }}
              />
            </AvatarImmersiveShell>
          )}
          <Card className="p-4 sm:p-6 border-border/50">
            <div className="text-sm font-medium">Quick prompts</div>
            <div className="mt-3 grid gap-2">
              {[
                "Build me a 12-month runway plan (assume $12k MRR, 60% gross margin).",
                "Create a simple budget template for a 5-person startup.",
                "How do I calculate burn and runway? Give me the formulas.",
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  className="text-left text-sm rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors px-3 py-2"
                  onClick={() => setInput(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

