"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Send, Loader2, X, Maximize2 } from "lucide-react"

const FINNA_ICON = "/icons/finna.PNG"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const suggestedActions = [
  "What is Trackify Atlas?",
  "How does the platform work?",
  "Tell me about Africa's startup ecosystem",
  "What features are available?",
  "How do I get started?",
  "What are the pricing plans?",
]

type ChatMessage = { role: "user" | "assistant"; content: string }

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

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
          className="fixed bottom-6 right-6 h-15 w-15 rounded-full shadow-xl shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/90 z-50 transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 p-0 flex items-center justify-center"
          onClick={() => setIsOpen(true)}
          aria-label="Open Finna AI Assistant"
          title="Chat with Finna AI"
        >
          <img src={FINNA_ICON} alt="" className="h-[3rem] w-[3rem] min-h-[50px] min-w-[50px] object-contain" />
        </Button>
      )}

      {/* Assistant Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Finna AI chat"
          className="fixed bottom-6 right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[min(560px,calc(100vh-6rem))] sm:h-[600px] flex flex-col shadow-2xl rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl z-50 animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <CardHeader className="shrink-0 border-b border-border/60 bg-muted/30 px-4 py-3 rounded-t-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1.5">
                  <img src={FINNA_ICON} alt="Finna" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base font-semibold truncate">Finna AI</CardTitle>
                  <p className="text-xs text-muted-foreground">Your Atlas assistant</p>
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
          <CardContent className="p-0 flex flex-col flex-1 min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 scroll-smooth">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-2 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 overflow-hidden p-2.5">
                    <img src={FINNA_ICON} alt="Finna" className="h-full w-full object-contain" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Hi, I'm Finna</p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
                    Ask me about Trackify Atlas, fundraising, or the African startup ecosystem.
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedActions.slice(0, 4).map((action) => (
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
                    <div className="flex gap-2 justify-start">
                      <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
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

            {/* Input */}
            <div className="shrink-0 p-4 pt-2 border-t border-border/60 bg-background/50 rounded-b-2xl">
              <div className="flex gap-2">
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
                  className="rounded-xl border-border/60 focus-visible:ring-primary/20 min-h-10"
                />
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
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Press Enter to send</p>
            </div>
          </CardContent>
        </div>
      )}
    </>
  )
}
