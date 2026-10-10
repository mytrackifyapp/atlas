"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { AiAgentsHubView } from "@/components/ai-agents-hub-view"
import {
  FinnaConversation,
  type FinnaChatMessage,
} from "@/components/finna-conversation"

export function FinnaWorkspace({
  viewerRole,
}: {
  viewerRole: "founder" | "investor"
}) {
  const [viewRole, setViewRole] = useState(viewerRole)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<FinnaChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesRef = useRef<FinnaChatMessage[]>([])
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
    setViewRole(viewerRole)
    window.sessionStorage.setItem("trackify-view-role", viewerRole)
  }, [viewerRole])

  const sendToFinna = useCallback(async (userContent: string) => {
    const text = userContent.trim()
    if (!text) return

    const payload: FinnaChatMessage[] = [
      ...messagesRef.current,
      { role: "user", content: text },
    ]
    messagesRef.current = payload
    setDraft("")
    setIsLoading(true)
    setMessages(payload)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload, viewerRole: viewRole }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Something went wrong. Please try again." },
        ])
        return
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content ?? "" },
      ])
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
  }, [viewRole])

  useEffect(() => {
    const q = searchParams.get("q")?.trim()
    if (!q || initialQueryHandled.current) return
    initialQueryHandled.current = true
    void sendToFinna(q)
    router.replace("/finna", { scroll: false })
  }, [searchParams, sendToFinna, router])

  const handleNewChat = () => {
    messagesRef.current = []
    initialQueryHandled.current = true
    setMessages([])
    setDraft("")
    router.replace("/finna", { scroll: false })
  }

  if (messages.length === 0 && !isLoading) {
    return <AiAgentsHubView viewerRole={viewRole} onAsk={sendToFinna} />
  }

  return (
    <FinnaConversation
      messages={messages}
      isLoading={isLoading}
      draft={draft}
      onDraftChange={setDraft}
      onSend={sendToFinna}
      onNewChat={handleNewChat}
    />
  )
}
