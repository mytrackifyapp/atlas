"use client"

import { MarketingGlassNavbar } from "@/components/marketing-glass-navbar"
import { useSession } from "@/lib/auth-client"

export default function TrackifyVcNavbar() {
  const session = useSession()
  const isLoggedIn = !!session?.data?.user

  return (
    <MarketingGlassNavbar
      className="sticky top-0 bg-transparent pb-4"
      primaryHref={isLoggedIn ? "/dashboard" : "/sign-up"}
      primaryLabel={isLoggedIn ? "Dashboard" : "Sign up"}
      variant="light"
    />
  )
}
