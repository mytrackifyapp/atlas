export const INVESTOR_STAKEHOLDER_CARDS = [
  {
    label: "Venture Capital",
    tag: "VENTURE CAPITAL",
    title: "Track Capital Activity",
    description:
      "Monitor capital deployment, portfolio performance, and LP reporting seamlessly in one unified platform.",
    href: "/portfolio",
    img: { src: "/images/img1.PNG", alt: "Venture Capital Management", className: "object-cover object-top" },
  },
  {
    label: "Private Equity",
    tag: "PRIVATE EQUITY",
    title: "Manage Funds & SPVs",
    description:
      "Oversee funds, SPVs, and cap tables with unrivaled visibility, precision, and control across your portfolio.",
    href: "/portfolio",
    img: { src: "/images/img2.PNG", alt: "Private Equity Management", className: "object-cover object-left" },
  },
  {
    label: "Corporations",
    tag: "CORPORATIONS",
    title: "Equity Management",
    description:
      "Plan and manage equity throughout your startup journey, from raising funds to IPO and beyond.",
    href: "/companies",
    img: { src: "/images/img3.PNG", alt: "Corporate Innovation", className: "object-cover object-[60%]" },
  },
  {
    label: "Limited Partners",
    tag: "LIMITED PARTNERS",
    title: "Fund Performance",
    description:
      "Monitor fund performance, allocations, and reports across all your private market holdings with clarity.",
    href: "/portfolio",
    img: { src: "/images/img4.PNG", alt: "Limited Partners", className: "object-cover object-right" },
  },
] as const
