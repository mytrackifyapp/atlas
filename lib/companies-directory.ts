export const COMPANY_FOCUSES = [
  "All",
  "Fintech",
  "Music Tech",
  "Proptech",
  "Autotech",
  "Talent Tech",
] as const

export type CompanyFocus = (typeof COMPANY_FOCUSES)[number]

export type DirectoryCompany = {
  id: string
  name: string
  description: string
  focus: Exclude<CompanyFocus, "All">
}

export const COMPANIES_DIRECTORY: DirectoryCompany[] = [
  {
    id: "trackify-finance",
    name: "Trackify Finance",
    description:
      "A fintech platform for investors and founders — separate dashboards tailored to each role, with finance management, portfolio insights, and AI employees built in.",
    focus: "Fintech",
  },
  {
    id: "rizflow",
    name: "Rizflow",
    description:
      "Music marketing and community platform for artists — release tools, fan engagement, and growth systems to help creators build audience and momentum.",
    focus: "Music Tech",
  },
  {
    id: "moodify",
    name: "Moodify",
    description:
      "Luxury property marketplace to buy and sell premium real estate — curated listings, rich media, and a high-trust experience for discerning buyers and sellers.",
    focus: "Proptech",
  },
  {
    id: "carfusion",
    name: "CarFusion",
    description:
      "The Shopify for car dealers — shop, buy, and rent vehicles with a branded virtual showroom for every dealership on the platform.",
    focus: "Autotech",
  },
  {
    id: "payollar",
    name: "Payollar",
    description:
      "Booking and payments for talent — get booked, get paid, and hire media professionals in one place for creators, agencies, and production teams.",
    focus: "Talent Tech",
  },
]

export function focusLabel(focus: DirectoryCompany["focus"]) {
  return focus.toUpperCase()
}
