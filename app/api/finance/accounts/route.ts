import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const workspaceId = request.nextUrl.searchParams.get("workspaceId")
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const rows = await db
      .collection("finance_accounts")
      .find({ ownerId: session.user.id, workspaceId })
      .sort({ createdAt: 1 })
      .toArray()

    return NextResponse.json({
      accounts: rows.map((a: any) => ({
        id: a._id.toString(),
        workspaceId: a.workspaceId,
        name: a.name,
        type: a.type,
        subtype: a.subtype ?? null,
        currency: a.currency,
        balance: a.balance,
        institution: a.institution ?? null,
        interestRateApr: a.interestRateApr ?? null,
        overdraftLimit: a.overdraftLimit ?? null,
        goalAmount: a.goalAmount ?? null,
        notes: a.notes ?? null,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    })
  } catch (error) {
    console.error("finance accounts GET error:", error)
    return NextResponse.json({ error: "Failed to load accounts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const workspaceId = body?.workspaceId
    const name = body?.name
    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 })
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const doc = {
      ownerId: session.user.id,
      workspaceId,
      name: name.trim(),
      type: typeof body?.type === "string" ? body.type : "bank",
      subtype: body?.subtype === "savings" || body?.subtype === "current" ? body.subtype : "current",
      currency: typeof body?.currency === "string" ? body.currency : "USD",
      balance: typeof body?.balance === "number" && Number.isFinite(body.balance) ? body.balance : 0,
      institution: typeof body?.institution === "string" ? body.institution : "",
      interestRateApr:
        typeof body?.interestRateApr === "number" && Number.isFinite(body.interestRateApr)
          ? body.interestRateApr
          : null,
      overdraftLimit:
        typeof body?.overdraftLimit === "number" && Number.isFinite(body.overdraftLimit)
          ? body.overdraftLimit
          : null,
      goalAmount:
        typeof body?.goalAmount === "number" && Number.isFinite(body.goalAmount) ? body.goalAmount : null,
      notes: typeof body?.notes === "string" ? body.notes : "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const db = await getDatabase()
    const res = await db.collection("finance_accounts").insertOne(doc)

    return NextResponse.json({
      account: { id: res.insertedId.toString(), ...doc },
    })
  } catch (error) {
    console.error("finance accounts POST error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}

