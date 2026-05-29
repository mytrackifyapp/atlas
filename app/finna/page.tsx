import { FinnaChatFullPage } from "@/components/finna-chat-fullpage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Finna AI | Trackify",
  description: "Chat with Finna, your AI assistant for Trackify — finance, fundraising, and portfolio guidance.",
}

export default function FinnaPage() {
  return (
    <main className="min-h-screen bg-background">
      <FinnaChatFullPage />
    </main>
  )
}
