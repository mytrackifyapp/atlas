import { FinnaChatFullPage } from "@/components/finna-chat-fullpage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Finna AI | Trackify Atlas",
  description: "Chat with Finna, your AI assistant for Trackify Atlas.",
}

export default function FinnaPage() {
  return (
    <main className="min-h-screen bg-background">
      <FinnaChatFullPage />
    </main>
  )
}
