import { NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getUsAccountWaitlist, joinUsAccountWaitlist } from "@/lib/finance/us-account-waitlist"

export const dynamic = "force-dynamic"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET() {
  const session = await getSessionWithRole()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await getUsAccountWaitlist(session.user.id)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const session = await getSessionWithRole()
  if (!session?.user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 })
  }

  const data = await joinUsAccountWaitlist({
    userId: session.user.id,
    email,
    name: session.user.name ?? null,
  })
  return NextResponse.json(data)
}
