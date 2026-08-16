import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import BlogHero from "@/components/trackifyvc/blog/blog-hero"
import BlogSection from "@/components/trackifyvc/blog/blog-section"
import TrackifyVcOriginalFaq from "@/components/trackifyvc/original-faq"
import TrackifyVcOriginalCta from "@/components/trackifyvc/original-cta"
import { MarketingFooter } from "@/components/marketing-footer"

export default function BlogPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <TrackifyVcNavbar />
      <div className="w-full relative flex flex-col pt-16">
        <BlogHero />
        <BlogSection />
        <TrackifyVcOriginalFaq />
        <TrackifyVcOriginalCta />
        <MarketingFooter />
      </div>
    </div>
  )
}

