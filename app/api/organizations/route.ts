import { auth } from "@/lib/auth"
import { getUserAccessibleOrganizations } from "@/lib/utils/organization"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const organizations = await getUserAccessibleOrganizations(session.user.id)
  
  return NextResponse.json(organizations)
}
