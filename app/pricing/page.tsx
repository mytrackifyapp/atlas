import type { Metadata } from "next"

import { PricingPageContent } from "@/components/pricing/pricing-page-content"

export const metadata: Metadata = {
  title: "Pricing | Trackify Atlas",
  description:
    "Simple subscription plans for founders and teams—start free, upgrade to Pro or Team for fundraising, AI employees, and investor tooling.",
}

export default function PricingPage() {
  return <PricingPageContent />
}
