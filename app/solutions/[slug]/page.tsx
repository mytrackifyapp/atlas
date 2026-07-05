import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SolutionPageContent } from "@/components/solutions/solution-page-content"
import { getSolutionBySlug, SOLUTION_SLUGS } from "@/lib/solutions-content"

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return SOLUTION_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const solution = getSolutionBySlug(slug)

  if (!solution) {
    return { title: "Solution | Trackify Finance" }
  }

  return {
    title: solution.title,
    description: solution.description,
  }
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params
  const solution = getSolutionBySlug(slug)

  if (!solution) {
    notFound()
  }

  return <SolutionPageContent solution={solution} />
}
