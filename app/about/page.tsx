import AboutHero from "@/components/trackifyvc/about/about-hero"
import OurMission from "@/components/trackifyvc/about/our-mission"
import OurStart from "@/components/trackifyvc/about/our-start"
import OurStory from "@/components/trackifyvc/about/our-story"
import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import TrackifyVcOriginalCta from "@/components/trackifyvc/original-cta"
import { MarketingFooter } from "@/components/marketing-footer"
import TrackifyVcOriginalFaq from "@/components/trackifyvc/original-faq"

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen relative flex flex-col bg-black text-white">
      <TrackifyVcNavbar />
      <AboutHero />
      <OurStory />
      <OurStart />
      <OurMission />
      <TrackifyVcOriginalFaq />
      <TrackifyVcOriginalCta />
      <MarketingFooter />
    </div>
  )
}

