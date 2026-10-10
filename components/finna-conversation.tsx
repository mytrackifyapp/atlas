"use client"

import { useRef, useEffect } from "react"
import { AudioLines, Loader2, Mic, Plus } from "lucide-react"

import { ChatMessageText } from "@/components/chat-message-text"
import { FinnaOrb } from "@/components/finna-orb"
import { FinnaThinkingPill } from "@/components/finna-thinking-pill"
import { FinnaVoiceBeam } from "@/components/finna-voice-beam"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFinnaVoice } from "@/hooks/use-finna-voice"
import { cn } from "@/lib/utils"

export type FinnaChatMessage = { role: "user" | "assistant"; content: string }

export function FinnaConversation({
  messages,
  isLoading,
  draft,
  onDraftChange,
  onSend,
  onNewChat,
}: {
  messages: FinnaChatMessage[]
  isLoading: boolean
  draft: string
  onDraftChange: (value: string) => void
  onSend: (text: string) => void
  onNewChat: () => void
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const voice = useFinnaVoice({
    onFinalTranscript: (text) => {
      const next = [draft, text].filter(Boolean).join(" ").trim()
      onDraftChange(next)
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSend = () => {
    const text = draft.trim()
    if (!text || isLoading) return
    onSend(text)
  }

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FinnaOrb thinking={isLoading} size={20} />
          <div className="min-w-0">
            <h1 className="text-base font-semibold">Finna</h1>
            <p className="text-xs text-muted-foreground">Your operating partner</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={onNewChat}>
          <Plus className="mr-1.5 h-4 w-4" />
          New chat
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="mt-1 shrink-0">
                <FinnaOrb size={20} />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
                msg.role === "user"
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md border border-border/40 bg-muted"
              }`}
            >
              {msg.role === "assistant" ? (
                <ChatMessageText content={msg.content} />
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <FinnaThinkingPill />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 overflow-visible border-t border-border/60 bg-[#f4f4f5] pt-4 dark:bg-neutral-950">
        <FinnaVoiceBeam
          stream={voice.listening ? voice.stream : null}
          processing={isLoading}
        >
          <div className="flex gap-2 rounded-xl border border-border/60 bg-white p-1 dark:bg-neutral-900">
            <Input
              placeholder={voice.listening ? "Listening…" : "Ask Finna anything…"}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isLoading}
              className="min-h-11 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            {voice.supported ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-11 w-11 shrink-0 rounded-xl",
                  voice.listening && "text-red-500 hover:text-red-500",
                )}
                onClick={() => void voice.toggle()}
                aria-label={voice.listening ? "Stop listening" : "Voice input"}
              >
                <Mic className="h-4 w-4" />
              </Button>
            ) : null}
            <Button
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSend}
              disabled={isLoading || !draft.trim()}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AudioLines className="h-4 w-4" strokeWidth={2.25} />
              )}
            </Button>
          </div>
        </FinnaVoiceBeam>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">Press Enter to send</p>
      </div>
    </div>
  )
}
