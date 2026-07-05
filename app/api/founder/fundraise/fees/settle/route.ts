import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { settlePlatformFees } from "@/lib/fundraising/platform-fees"
import { getActiveFundraiseForFounder } from "@/lib/fundraising/service"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  txHash: z.string().min(1),
  chainId: z.enum(["base", "polygon", "ethereum"]),
  stablecoin: z.enum(["USDC", "USDT"]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fundraise = await getActiveFundraiseForFounder(session.user.id)
    if (!fundraise) {
      return NextResponse.json({ error: "No active fundraise found" }, { status: 404 })
    }

    const body = bodySchema.parse(await request.json())

    const result = await settlePlatformFees({
      fundraiseId: fundraise.id,
      founderUserId: session.user.id,
      chainId: body.chainId,
      stablecoin: body.stablecoin,
      txHash: body.txHash,
    })

    return NextResponse.json({ success: true, settlement: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid settlement request" }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Failed to settle platform fees"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
