import type { Metadata } from "next"

import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import TrackifyVcContactForm from "@/components/trackifyvc/contact/contact-form"
import TrackifyVcContactHero from "@/components/trackifyvc/contact/contact-hero"
import { MarketingFooter } from "@/components/marketing-footer"

export const metadata: Metadata = {
  title: "Contact | Trackify Finance",
  description:
    "Talk to the Trackify team about sales, partnerships, or support. We typically reply within one business day.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <TrackifyVcNavbar />
      <main>
        <section className="px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-12 lg:pb-24 lg:pt-36">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
            <TrackifyVcContactHero />
            <TrackifyVcContactForm />
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
