import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import TrackifyVcContactForm from "@/components/trackifyvc/contact/contact-form"
import TrackifyVcContactHero from "@/components/trackifyvc/contact/contact-hero"
import TrackifyVcOriginalCta from "@/components/trackifyvc/original-cta"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <TrackifyVcNavbar />
      <main className="w-full relative flex flex-col pt-16">
        <TrackifyVcContactHero />
        <TrackifyVcContactForm />
        <TrackifyVcOriginalCta />
      </main>
    </div>
  )
}

