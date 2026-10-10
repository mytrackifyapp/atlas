import type { Metadata } from "next"
import { Geist } from "next/font/google"

import { LinkedInContentStudio } from "@/components/content/linkedin-content-studio"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LinkedIn posts · Content studio",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function ContentStudioPage() {
  return (
    <div className={geist.className} data-linkedin-studio>
      <LinkedInContentStudio />
    </div>
  )
}
