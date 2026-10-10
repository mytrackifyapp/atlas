import type { Metadata } from "next"

import { DeckDocumentTheme } from "@/components/deck/deck-document-theme"
import { InfrastructureGapDeck } from "@/components/pitch/infrastructure-gap-deck"
import { InfrastructurePrintBar } from "@/components/pitch/infrastructure-print-bar"

export const metadata: Metadata = {
  title: "The infrastructure gap · Trackify",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function InfrastructurePitchPage() {
  return (
    <div className="gap-deck dark min-h-screen bg-neutral-950 text-white">
      <DeckDocumentTheme rootClass="gap-print-root" />
      <InfrastructurePrintBar />
      <InfrastructureGapDeck />
    </div>
  )
}
