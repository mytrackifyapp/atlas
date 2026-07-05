import type { Metadata } from "next"

import { CompaniesPageContent } from "@/components/companies/companies-page-content"

export const metadata: Metadata = {
  title: "Companies | Trackify Finance",
  description:
    "Explore companies building on Trackify — fintech, proptech, autotech, music tech, and talent platforms.",
}

export default function CompaniesPage() {
  return <CompaniesPageContent />
}
