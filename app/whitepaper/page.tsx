import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import PaperHero from "@/components/trackifyvc/whitepaper/paper-hero"
import OurMission from "@/components/trackifyvc/about/our-mission"
import OurStart from "@/components/trackifyvc/about/our-start"
import OurStory from "@/components/trackifyvc/about/our-story"
import TrackifyVcOriginalFaq from "@/components/trackifyvc/original-faq"
import TrackifyVcOriginalCta from "@/components/trackifyvc/original-cta"

export default function WhitePaperPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <TrackifyVcNavbar />
      <div className="w-full relative flex flex-col pt-16">
        <PaperHero />
        <OurStory />
        <OurStart />
        <OurMission />
        <TrackifyVcOriginalFaq />
        <TrackifyVcOriginalCta />
      </div>
    </div>
  )
}

