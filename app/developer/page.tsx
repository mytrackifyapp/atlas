import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import DevApi from "@/components/trackifyvc/developer/dev-api"
import ApiQuestions from "@/components/trackifyvc/developer/api-question"
import TrackifyVcOriginalFaq from "@/components/trackifyvc/original-faq"
import TrackifyVcOriginalCta from "@/components/trackifyvc/original-cta"

export default function DeveloperPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <TrackifyVcNavbar />
      <div className="w-full relative flex flex-col pt-16">
        <DevApi />
        <ApiQuestions />
        <TrackifyVcOriginalFaq />
        <TrackifyVcOriginalCta />
      </div>
    </div>
  )
}

