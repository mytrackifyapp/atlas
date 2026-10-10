"use client"

import { MarketingGlassNavbar } from "@/components/marketing-glass-navbar"
import { useSession } from "@/lib/auth-client"

export default function TrackifyVcNavbar({
  signedOutSignUpHref = "/sign-up",
  signedOutSignInHref = "/sign-in",
  signedInHref = "/dashboard",
  signedInLabel = "Dashboard",
}: {
  signedOutSignUpHref?: string
  signedOutSignInHref?: string
  signedInHref?: string
  signedInLabel?: string
}) {
  const session = useSession()
  const isLoggedIn = !!session?.data?.user

  return (
    <MarketingGlassNavbar
      className="sticky top-0 bg-transparent pb-4"
      primaryHref={isLoggedIn ? signedInHref : signedOutSignUpHref}
      primaryLabel={isLoggedIn ? signedInLabel : "Sign up"}
      loginHref={signedOutSignInHref}
      variant="light"
    />
  )
}
