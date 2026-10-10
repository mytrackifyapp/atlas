import type { Metadata } from "next"

import { IncorporatePageContent } from "@/components/incorporate/incorporate-page-content"

export const metadata: Metadata = {
  title: "Register a U.S. company | Trackify Finance",
  description:
    "Form an LLC or C-Corp in the United States from your Trackify dashboard. Palm files with the state, then you run finance, fundraising, and investor reporting here.",
}

export default function IncorporatePage() {
  return <IncorporatePageContent />
}
