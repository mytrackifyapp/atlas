import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { palmErrorResponse, palmFetch } from "@/lib/palm/client"

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
        ? "/v1/filing/formation/corporation/validate"
        : "/v1/filing/formation/llc/validate"
    const { entity_type: _entityType, ...body } = payload
    if (entityType === "corporation" && Array.isArray(body.organizers) && !body.incorporators) {
      body.incorporators = body.organizers
    }
    const data = await palmFetch(path, {
      method: "POST",
      body: JSON.stringify(body),
    })
    return NextResponse.json(data)
  } catch (error) {
    const { status, body } = palmErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
