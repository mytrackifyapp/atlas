import type { Metadata } from "next"

import { DeckDocumentTheme } from "@/components/deck/deck-document-theme"
import { MasterclassDeck } from "@/components/masterclass/masterclass-deck"
import { MasterclassPrintBar } from "@/components/masterclass/print-bar"

export const metadata: Metadata = {
  title: "The AI Investment Thesis · Masterclass | Trackify",
  description:
    "A 20-page PDF masterclass on how AI is rewriting company economics, venture investing, and the future of autonomous finance — from Africa to the world.",
}

export default function MasterclassPage() {
  return (
    <div className="masterclass-deck dark min-h-screen bg-neutral-950 text-white">
      <DeckDocumentTheme rootClass="masterclass-print-root" />
      <MasterclassPrintBar />
      <MasterclassDeck />
    </div>
  )
}
