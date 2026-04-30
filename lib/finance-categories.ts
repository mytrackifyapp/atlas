import {
  BadgeDollarSign,
  Banknote,
  Building2,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Laptop,
  Megaphone,
  Receipt,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Utensils,
  Users,
  Wrench,
} from "lucide-react"

export type FinanceCategoryId =
  | "salary"
  | "sales"
  | "investments"
  | "interest"
  | "grants"
  | "refunds"
  | "rent"
  | "payroll"
  | "marketing"
  | "travel"
  | "software"
  | "legal"
  | "taxes"
  | "office"
  | "utilities"
  | "insurance"
  | "banking_fees"
  | "meals"
  | "health"
  | "education"
  | "maintenance"
  | "shipping"
  | "purchases"
  | "other"

export type FinanceCategory = {
  id: FinanceCategoryId
  label: string
  icon: React.ComponentType<{ className?: string }>
  defaultDirection: "income" | "expense" | "either"
}

export const FINANCE_CATEGORIES: FinanceCategory[] = [
  { id: "salary", label: "Salary", icon: BadgeDollarSign, defaultDirection: "income" },
  { id: "sales", label: "Sales / Revenue", icon: Landmark, defaultDirection: "income" },
  { id: "investments", label: "Investments", icon: BriefcaseBusiness, defaultDirection: "income" },
  { id: "interest", label: "Interest", icon: Banknote, defaultDirection: "income" },
  { id: "grants", label: "Grants", icon: Gift, defaultDirection: "income" },
  { id: "refunds", label: "Refunds", icon: Receipt, defaultDirection: "income" },

  { id: "rent", label: "Rent", icon: Home, defaultDirection: "expense" },
  { id: "payroll", label: "Payroll", icon: Users, defaultDirection: "expense" },
  { id: "marketing", label: "Marketing", icon: Megaphone, defaultDirection: "expense" },
  { id: "travel", label: "Travel", icon: Truck, defaultDirection: "expense" },
  { id: "software", label: "Software", icon: Laptop, defaultDirection: "expense" },
  { id: "legal", label: "Legal", icon: Scale, defaultDirection: "expense" },
  { id: "taxes", label: "Taxes", icon: FileText, defaultDirection: "expense" },
  { id: "office", label: "Office", icon: Building2, defaultDirection: "expense" },
  { id: "utilities", label: "Utilities", icon: Wrench, defaultDirection: "expense" },
  { id: "insurance", label: "Insurance", icon: ShieldCheck, defaultDirection: "expense" },
  { id: "banking_fees", label: "Banking fees", icon: CreditCard, defaultDirection: "expense" },
  { id: "meals", label: "Meals", icon: Utensils, defaultDirection: "expense" },
  { id: "health", label: "Health", icon: HeartPulse, defaultDirection: "expense" },
  { id: "education", label: "Education", icon: GraduationCap, defaultDirection: "expense" },
  { id: "maintenance", label: "Maintenance", icon: Wrench, defaultDirection: "expense" },
  { id: "shipping", label: "Shipping", icon: Truck, defaultDirection: "expense" },
  { id: "purchases", label: "Purchases", icon: ShoppingCart, defaultDirection: "expense" },

  { id: "other", label: "Other", icon: Receipt, defaultDirection: "either" },
]

export function categoryIconFor(label: string) {
  const match = FINANCE_CATEGORIES.find((c) => c.label.toLowerCase() === label.toLowerCase())
  return match?.icon ?? Receipt
}

