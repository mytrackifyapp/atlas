import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { clearUserWallet, getUserWallet, saveUserWallet } from "@/lib/wallets/service"

export const dynamic = "force-dynamic"

const saveSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number().int().positive(),
  chainLabel: z.string().min(1).max(64),
  provider: z.string().min(1).max(64),
  nativeBalance: z.string().min(1),
  nativeSymbol: z.string().min(1).max(16),
  usdcBalance: z.string().nullable().optional(),
  usdtBalance: z.string().nullable().optional(),
})

export async function GET() {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const wallet = await getUserWallet(session.user.id)
    return NextResponse.json({ wallet })
  } catch (e) {
    console.error("User wallet GET error:", e)
    return NextResponse.json({ error: "Failed to load wallet" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = saveSchema.parse(await request.json())
    const wallet = await saveUserWallet(session.user.id, {
      address: body.address.toLowerCase(),
      chainId: body.chainId,
      chainLabel: body.chainLabel,
      provider: body.provider,
      nativeBalance: body.nativeBalance,
      nativeSymbol: body.nativeSymbol,
      usdcBalance: body.usdcBalance ?? null,
      usdtBalance: body.usdtBalance ?? null,
    })

    return NextResponse.json({ wallet })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid wallet data" }, { status: 400 })
    }
    console.error("User wallet POST error:", e)
    return NextResponse.json({ error: "Failed to save wallet" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clearUserWallet(session.user.id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("User wallet DELETE error:", e)
    return NextResponse.json({ error: "Failed to disconnect wallet" }, { status: 500 })
  }
}
