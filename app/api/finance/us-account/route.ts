import { NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { WewireError } from "@/lib/wewire/client"
import { getUsBankAccount, requestUsBankAccount } from "@/lib/wewire/us-account"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSessionWithRole()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const data = await getUsBankAccount(session.user.id)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load US account"
    const status = error instanceof WewireError ? error.status : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  const session = await getSessionWithRole()
  if (!session?.user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.sourceOfFunds || !body?.country || !body?.type) {
    return NextResponse.json({ error: "Country, account type, and source of funds are required" }, { status: 400 })
  }
  if (body.type === "BUSINESS" && !body.businessName) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 })
  }
  if (body.type === "INDIVIDUAL" && (!body.firstName || !body.lastName)) {
    return NextResponse.json({ error: "First and last name are required" }, { status: 400 })
  }

  try {
    const data = await requestUsBankAccount({
      userId: session.user.id,
      email: session.user.email,
      type: body.type,
      country: body.country,
      businessName: body.businessName,
      businessType: body.businessType,
      firstName: body.firstName,
      lastName: body.lastName,
      sourceOfFunds: body.sourceOfFunds,
      accountPurpose: body.accountPurpose,
      tin: body.tin,
      taxResidenceCountry: body.taxResidenceCountry,
    })
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request US account"
    const status = error instanceof WewireError ? error.status : 500
    return NextResponse.json({ error: message }, { status })
  }
}
