import { auth } from "@/lib/auth"
import { getUserAccessibleOrganizations } from "@/lib/utils/organization"
import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/utils/rate-limit"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rateLimitResult = rateLimit(`organizations:${session.user.id}`)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    )
  }

  const organizations = await getUserAccessibleOrganizations(session.user.id)

  return NextResponse.json(organizations)
}
