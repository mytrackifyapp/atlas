import type { Metadata } from "next"
import { CvPrintBar } from "@/components/cv/cv-print-bar"
import { DivineGabrielCv } from "@/components/cv/divine-gabriel-cv"

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
    <div className="min-h-screen bg-gradient-to-b from-emerald-950/[0.04] via-background to-background text-foreground print:bg-white">
      <CvPrintBar />
      <DivineGabrielCv />
    </div>
  )
}
