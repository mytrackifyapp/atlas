import type { Metadata } from "next"

import { CapitalPageContent } from "@/components/capital/capital-page-content"

export const metadata: Metadata = {
  title: "Trackify Capital | Private markets infrastructure",
  description:
    "Discover, access, manage, and eventually trade private-market investments. Trackify Capital connects investors, fund managers, and high-growth companies.",
}

export default function CapitalPage() {
  return <CapitalPageContent />
}
