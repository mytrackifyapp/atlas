import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const body = await request.json()
    const update: Record<string, unknown> = { updatedAt: new Date() }
    if (body?.name != null) update.name = body.name
    if (body?.type != null) update.type = body.type
    if (body?.subtype != null) update.subtype = body.subtype
    if (body?.currency != null) update.currency = body.currency
    if (body?.balance != null) update.balance = body.balance
    if (body?.institution != null) update.institution = body.institution
    if (body?.interestRateApr !== undefined) update.interestRateApr = body.interestRateApr
    if (body?.overdraftLimit !== undefined) update.overdraftLimit = body.overdraftLimit
    if (body?.goalAmount !== undefined) update.goalAmount = body.goalAmount
    if (body?.notes != null) update.notes = body.notes

    const db = await getDatabase()
    const result = await db.collection("finance_accounts").findOneAndUpdate(
      { _id: new ObjectId(id), ownerId: session.user.id },
      { $set: update },
      { returnDocument: "after" },
    )

    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const a: any = result
    return NextResponse.json({
      account: {
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
      },
    })
  } catch (error) {
    console.error("finance accounts PATCH error:", error)
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const db = await getDatabase()
    const res = await db.collection("finance_accounts").deleteOne({
      _id: new ObjectId(id),
      ownerId: session.user.id,
    })
    if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("finance accounts DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}

