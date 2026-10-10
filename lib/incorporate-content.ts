import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  FileText,
  Landmark,
  MapPin,
  Rocket,
  Wallet,
} from "lucide-react"

export const INCORPORATE_FEATURES: {
  title: string
  description: string
  icon: LucideIcon
  iconClass: string
}[] = [
  {
    title: "Register your U.S. business",
    description: "Form an LLC or C-Corp without chasing filings and paperwork yourself.",
    icon: Briefcase,
    iconClass: "bg-lime-100 text-lime-800",
  },
  {
    title: "U.S. bank account",
    description: "Get a path to a U.S. bank account once the entity is formed.",
    icon: Landmark,
    iconClass: "bg-violet-100 text-violet-800",
  },
  {
    title: "EIN and tax support",
    description: "Federal EIN, registered agent, and the tax basics a new company actually needs.",
    icon: FileText,
    iconClass: "bg-neutral-100 text-neutral-800",
  },
  {
    title: "Physical U.S. address",
    description: "A real U.S. address and mailroom so you can receive official notices.",
    icon: MapPin,
    iconClass: "bg-amber-100 text-amber-800",
  },
  {
    title: "Trackify finance",
    description: "Once formed, run cash, budgets, and runway in your founder workspace.",
    icon: Wallet,
    iconClass: "bg-emerald-100 text-emerald-800",
  },
  {
    title: "Investor-ready from day one",
    description: "Bring the new entity into Trackify for fundraising, cap table, and data room.",
    icon: Rocket,
    iconClass: "bg-sky-100 text-sky-800",
  },
]

export const INCORPORATE_STEPS = [
  {
    n: "01",
    title: "File from Trackify",
    body: "Choose LLC or C-Corp, state, and founder details. We submit the filing to Palm.",
  },
  {
    n: "02",
    title: "Get the U.S. stack",
    body: "Palm files with the state, can act as registered agent, and can apply for an EIN when the entity exists.",
  },
  {
    n: "03",
    title: "Operate on Trackify",
    body: "Run finance, fundraising, and investor reporting in one place once the company is formed.",
  },
]
