import type { Metadata } from "next"
import { PitchPrintBar } from "@/components/pitch/pitch-print-bar"
import { TrackifyPitch } from "@/components/pitch/trackify-pitch"

export const metadata: Metadata = {
  title: "Pitch · Trackify Finance",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function PitchPage() {
  return (
    <div className="pitch-deck dark min-h-screen bg-black text-white text-lg sm:text-xl">
      <PitchPrintBar />
      <TrackifyPitch />
    </div>
  )
}
