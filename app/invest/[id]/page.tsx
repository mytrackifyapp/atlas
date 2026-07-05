import { notFound } from "next/navigation"

import { FundraiseInvestorPage } from "@/components/fundraising/fundraise-investor-page"
import { getPublicFundraiseProfile } from "@/lib/fundraising/service"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ preview?: string }>
}

export default async function PublicInvestPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { preview } = await searchParams
  const profile = await getPublicFundraiseProfile(id)

  if (!profile) notFound()

  return <FundraiseInvestorPage profile={profile} previewMode={preview === "1"} />
}
