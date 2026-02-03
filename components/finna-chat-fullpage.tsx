"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Send, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const FINNA_ICON = "/icons/finna.PNG"

const suggestedActions = [
  "What is Trackify Atlas?",
  "How does the platform work?",
  "Tell me about Africa's startup ecosystem",
  "What features are available?",
  "How do I get started?",
  "What are the pricing plans?",
]

type ChatMessage = { role: "user" | "assistant"; content: string }

export function FinnaChatFullPage() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const sendToFinna = async (userContent: string) => {
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userContent }]
    setMessages(newMessages)
    setMessage("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
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
    <div className="flex flex-col h-[calc(100vh-4rem)] min-h-0 bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border/60 bg-card/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto max-w-3xl flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0 rounded-lg" asChild>
            <Link href="/" aria-label="Back to home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden p-1.5">
              <img src={FINNA_ICON} alt="Finna" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">Finna AI</h1>
              <p className="text-xs text-muted-foreground">Your Atlas assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 overflow-hidden p-2.5">
                <img src={FINNA_ICON} alt="Finna" className="h-full w-full object-contain" />
              </div>
              <p className="text-base font-medium text-foreground mb-2">Hi, I'm Finna</p>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                Ask me about Trackify Atlas, fundraising, or the African startup ecosystem.
              </p>
              <p className="text-xs text-muted-foreground mb-4">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedActions.slice(0, 4).map((action) => (
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
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden p-1">
                      <img src={FINNA_ICON} alt="" className="h-full w-full object-contain" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md border border-border/40"
                    }`}
                  >
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-4 py-2.5 text-sm bg-muted border border-border/40 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-muted-foreground">Thinking…</span>
                  </div>
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
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">Press Enter to send</p>
      </div>
    </div>
  )
}
