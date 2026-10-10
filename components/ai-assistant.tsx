"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { AudioLines, Loader2, Maximize2, Mic, X } from "lucide-react"

import { ChatMessageText } from "@/components/chat-message-text"
import { FinnaOrb } from "@/components/finna-orb"
import { FinnaThinkingPill } from "@/components/finna-thinking-pill"
import { FinnaVoiceBeam } from "@/components/finna-voice-beam"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSession } from "@/lib/auth-client"
import {
  getFinnaIntro,
  getFinnaSuggestions,
  getFinnaTagline,
} from "@/lib/finna-suggestions"
import { useFinnaVoice } from "@/hooks/use-finna-voice"
import { cn } from "@/lib/utils"

type ChatMessage = { role: "user" | "assistant"; content: string }

export function AIAssistant({
  compactMobile = false,
  viewerRole,
}: {
  compactMobile?: boolean
  viewerRole?: "founder" | "investor" | null
}) {
  const { data: session } = useSession()
  const sessionRole = (session?.user as { role?: string | null } | undefined)?.role
  const signedIn = Boolean(session?.user)
  const role = viewerRole ?? sessionRole ?? (signedIn ? "founder" : null)
  const suggestions = getFinnaSuggestions(signedIn ? role : null)
  const tagline = getFinnaTagline(signedIn ? role : null)
  const intro = getFinnaIntro(signedIn ? role : null)
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const voice = useFinnaVoice({
    onFinalTranscript: (text) => {
      setMessage((prev) => [prev, text].filter(Boolean).join(" ").trim())
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const sendToFinna = async (userContent: string) => {
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userContent }]
    setMessages(newMessages)
    setMessage("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          viewerRole: signedIn ? role : null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Something went wrong. Please try again." },
        ])
        return
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.content ?? "" }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I couldn't reach the server. Please check your connection and try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = () => {
    const text = message.trim()
    if (!text || isLoading) return
    sendToFinna(text)
  }

  const handleSuggestionClick = (text: string) => {
    sendToFinna(text)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          size="lg"
          className={cn(
            "fixed z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary p-0 text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-200 hover:scale-105 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95",
            compactMobile
              ? "bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-4 lg:bottom-6 lg:right-6"
              : "bottom-6 right-6",
          )}
          onClick={() => setIsOpen(true)}
          aria-label="Open Finna AI Assistant"
          title="Chat with Finna AI"
        >
          <FinnaOrb size={64} theme="light" />
        </Button>
      )}

      {/* Assistant Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Finna AI chat"
          className={cn(
            "fixed z-50 flex max-w-[calc(100vw-2rem)] flex-col overflow-visible rounded-2xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200 slide-in-from-bottom-4",
            compactMobile
              ? "bottom-[calc(7rem+env(safe-area-inset-bottom))] right-4 h-[min(520px,calc(100dvh-8.5rem-env(safe-area-inset-bottom)))] w-[min(340px,calc(100vw-2rem))] lg:bottom-6 lg:right-6 lg:h-[560px]"
              : "bottom-6 right-6 h-[min(540px,calc(100vh-6rem))] w-[min(340px,calc(100vw-2rem))] sm:h-[560px]",
          )}
        >
          <CardHeader className="shrink-0 border-b border-border/60 bg-muted/30 px-4 py-3 rounded-t-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FinnaOrb thinking={isLoading} size={20} />
                <div className="min-w-0">
                  <CardTitle className="text-base font-semibold truncate">Finna AI</CardTitle>
                  <p className="text-xs text-muted-foreground">{tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg hover:bg-muted" asChild>
                  <Link href="/finna" aria-label="Open Finna chat in full page">
                    <Maximize2 className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-lg hover:bg-muted"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-visible p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 scroll-smooth">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-2 text-center">
                  <div className="mb-4">
                    <FinnaOrb size={64} />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Hi, I'm Finna</p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
                    {intro}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.slice(0, 4).map((action) => (
                      <button
                        key={action}
                        type="button"
                        className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted hover:border-primary/30 transition-colors disabled:opacity-50"
                        onClick={() => handleSuggestionClick(action)}
                        disabled={isLoading}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
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
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md border border-border/40"
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
                </>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 overflow-visible rounded-b-2xl border-t border-border/60 bg-background/50 px-4 pb-5 pt-4">
              <FinnaVoiceBeam
                stream={voice.listening ? voice.stream : null}
                processing={isLoading}
                type="pill"
                theme="light"
                scale={1.15}
                idle={0.48}
                strength={1}
              >
                <div className="flex gap-2 rounded-xl border border-border/60 bg-background p-1">
                  <Input
                    placeholder={voice.listening ? "Listening…" : "Ask Finna anything…"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    disabled={isLoading}
                    className="min-h-10 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
                  />
                  {voice.supported ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 shrink-0 rounded-xl",
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
                    className="shrink-0 rounded-xl h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleSend}
                    disabled={isLoading || !message.trim()}
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
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Press Enter to send</p>
            </div>
          </CardContent>
        </div>
      )}
    </>
  )
}
