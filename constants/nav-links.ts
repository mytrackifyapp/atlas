import {
  CreditCard,
  DatabaseZap,
  Info,
  Mail,
  NewspaperIcon,
  ScrollText,
  Wand2,
  Brain,
} from "lucide-react"

export const NAV_LINKS = [
  {
    title: "Virtual Cards",
    href: "/integrations",
    icon: CreditCard,
  },
  {
    title: "AI Agents",
    href: "/ai-agents",
    icon: Brain,
  },
  {
    title: "Finna AI",
    href: "/finna",
    icon: Brain,
  },
  {
    title: "About",
    href: "/about",
    icon: Info,
  },
  {
    title: "Resources",
    href: "/resources",
    icon: NewspaperIcon,
    menu: [
      {
        title: "Blog",
        tagline: "Read articles on the latest trends in tech.",
        href: "/blog",
        icon: NewspaperIcon,
      },
      {
        title: "White Paper",
        tagline: "Get answers to your questions.",
        href: "/whitepaper",
        icon: ScrollText,
      },
      {
        title: "Developer Api",
        tagline: "Get answers to your questions.",
        href: "/developer",
        icon: DatabaseZap,
      },
    ],
  },
  {
    title: "Contact",
    href: "/contact",
    icon: Mail,
  },
] as const

