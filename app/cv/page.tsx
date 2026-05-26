import type { Metadata } from "next"
import { CvPrintBar } from "@/components/cv/cv-print-bar"
import { DivineGabrielCv } from "@/components/cv/divine-gabriel-cv"
import { DeckDocumentTheme } from "@/components/deck/deck-document-theme"

export const metadata: Metadata = {
  title: "CV · Divine Gabriel",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function CvPage() {
  return (
    <div className="cv-deck pitch-deck dark min-h-screen bg-black text-white">
      <DeckDocumentTheme rootClass="cv-print-root" />
      <CvPrintBar />
      <DivineGabrielCv />
    </div>
  )
}
