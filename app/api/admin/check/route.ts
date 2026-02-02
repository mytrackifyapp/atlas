import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-helpers"

export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin()
    return NextResponse.json({ isAdmin: admin })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false }, { status: 200 })
  }
}

