import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import TrackifyVcIntegrationsHero from "@/components/trackifyvc/integrations/integrations-hero"
import TrackifyVcIntegrationsSection from "@/components/trackifyvc/integrations/integrations-section"
import { TrackifyVcStats } from "@/components/trackifyvc/stats"
import TrackifyVcOriginalBlogs from "@/components/trackifyvc/original-blogs"
import TrackifyVcOriginalCta from "@/components/trackifyvc/original-cta"

export default function IntegrationsPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <TrackifyVcNavbar />
      <div className="w-full relative flex flex-col pt-16">
        <TrackifyVcIntegrationsHero />
        <TrackifyVcIntegrationsSection />
        <TrackifyVcStats />
        <TrackifyVcOriginalBlogs />
        <TrackifyVcOriginalCta />
      </div>
    </div>
  )
}

