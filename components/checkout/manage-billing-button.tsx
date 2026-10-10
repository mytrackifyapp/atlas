"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ManageBillingButton() {
  const pathname = usePathname()
  const href = pathname.startsWith("/founder") ? "/founder/billing" : "/dashboard/billing"

  return (
    <Button asChild variant="outline" className="rounded-full">
      <Link href={href}>
        <CreditCard className="mr-2 h-4 w-4" />
        Manage billing
      </Link>
    </Button>
  )
}
