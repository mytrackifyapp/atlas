"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, AudioLines, Loader2 } from "lucide-react"
import { ChatMessageText } from "@/components/chat-message-text"
import { FinnaOrb } from "@/components/finna-orb"
import { FinnaThinkingPill } from "@/components/finna-thinking-pill"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "@/lib/auth-client"
import {
  getFinnaIntro,
  getFinnaSuggestions,
  getFinnaTagline,
} from "@/lib/finna-suggestions"

type ChatMessage = { role: "user" | "assistant"; content: string }

export function FinnaChatFullPage() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const sessionRole = (session?.user as { role?: string | null } | undefined)?.role ?? null
  const [viewRole, setViewRole] = useState<string | null>(sessionRole)
  const role = viewRole ?? sessionRole
  const suggestions = getFinnaSuggestions(role)
  const tagline = getFinnaTagline(role)
  const intro = getFinnaIntro(role)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<ChatMessage[]>([])
  const initialQueryHandled = useRef(false)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    const stored = window.sessionStorage.getItem("trackify-view-role")
    if (stored === "founder" || stored === "investor") {
      setViewRole(stored)
      return
    }
    if (sessionRole === "founder" || sessionRole === "investor") {
      setViewRole(sessionRole)
    }
  }, [sessionRole])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const sendToFinna = useCallback(async (userContent: string) => {
    const userMessage: ChatMessage = { role: "user", content: userContent }
    const payload = [...messagesRef.current, userMessage]
    messagesRef.current = payload
    setMessage("")
    setIsLoading(true)
    setMessages(payload)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload, viewerRole: role }),
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
        {
          role: "assistant",
          content: "I couldn't reach the server. Please check your connection and try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [role])

  useEffect(() => {
    const q = searchParams.get("q")?.trim()
    if (!q || initialQueryHandled.current) return
    initialQueryHandled.current = true
    void sendToFinna(q)
  }, [searchParams, sendToFinna])

  const handleSend = () => {
    const text = message.trim()
    if (!text || isLoading) return
    sendToFinna(text)
  }

  const handleSuggestionClick = (text: string) => {
    sendToFinna(text)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] min-h-0 bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border/60 bg-card/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto max-w-3xl flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0 rounded-lg" asChild>
            <Link href="/" aria-label="Back to home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <FinnaOrb thinking={isLoading} size={20} />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">Finna AI</h1>
              <p className="text-xs text-muted-foreground">{tagline}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="mb-6">
                <FinnaOrb size={64} />
              </div>
              <p className="text-base font-medium text-foreground mb-2">Hi, I'm Finna</p>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                {intro}
              </p>
              <p className="text-xs text-muted-foreground mb-4">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.slice(0, 4).map((action) => (
                  <button
                    key={action}
                    type="button"
                    className="inline-flex items-center rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted hover:border-primary/30 transition-colors disabled:opacity-50"
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
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border/60 bg-background/95 backdrop-blur-sm px-4 py-4">
        <div className="mx-auto max-w-3xl flex gap-2">
          <Input
            placeholder="Ask Finna anything…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={isLoading}
            className="rounded-xl border-border/60 focus-visible:ring-primary/20 min-h-11 flex-1"
          />
          <Button
            size="icon"
            className="shrink-0 rounded-xl h-11 w-11 bg-primary text-primary-foreground hover:bg-primary/90"
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
        <p className="text-[10px] text-muted-foreground mt-2 text-center">Press Enter to send</p>
      </div>
    </div>
  )
}
