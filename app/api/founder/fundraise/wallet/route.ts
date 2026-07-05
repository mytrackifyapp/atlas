import { NextRequest, NextResponse } from "next/server"

import { bindReceivingWalletFromSettings } from "@/lib/fundraising/service"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fundraise = await bindReceivingWalletFromSettings(session.user.id)
    return NextResponse.json({ success: true, fundraise })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to bind wallet"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
