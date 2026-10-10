import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"
import { palmErrorResponse, palmFetch } from "@/lib/palm/client"

export async function GET() {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = await getDatabase()
  const rows = await db
    .collection("palm_filings")
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()

  return NextResponse.json({
    configured: Boolean(process.env.PALM_API_KEY?.trim()),
    filings: rows.map((row) => ({
      id: row.filingId,
      businessId: row.businessId ?? null,
      status: row.status,
      entityType: row.entityType,
      jurisdiction: row.jurisdiction,
      name: row.entityName,
      mode: row.mode ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  })
}

export async function POST(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>
    const entityType = payload.entity_type === "corporation" ? "corporation" : "llc"
    const path =
      entityType === "corporation"
        ? "/v1/filing/formation/corporation"
        : "/v1/filing/formation/llc"

    const { entity_type: _entityType, ...body } = payload
    if (entityType === "corporation" && Array.isArray(body.organizers) && !body.incorporators) {
      body.incorporators = body.organizers
    }

    const idempotencyKey = crypto.randomUUID()
    const filing = await palmFetch<Record<string, unknown>>(path, {
      method: "POST",
      body: JSON.stringify({
        ...body,
        metadata: {
          trackify_user_id: session.user.id,
          ...(typeof body.metadata === "object" && body.metadata ? body.metadata : {}),
        },
      }),
      idempotencyKey,
    })

    const filingId = String(filing.id ?? "")
    if (!filingId) {
      return NextResponse.json({ error: "Palm did not return a filing id" }, { status: 502 })
    }

    const db = await getDatabase()
    const now = new Date()
    await db.collection("palm_filings").insertOne({
      userId: session.user.id,
      filingId,
      businessId: filing.business_id ?? null,
      entityType,
      entityName: filing.name ?? body.entity_name,
      jurisdiction: filing.jurisdiction ?? body.jurisdiction,
      status: filing.status ?? "queued",
      mode: filing.mode ?? null,
      idempotencyKey,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({ filing }, { status: 201 })
  } catch (error) {
    const { status, body } = palmErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
