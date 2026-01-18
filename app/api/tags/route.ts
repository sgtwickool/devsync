import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""
  const organizationId = searchParams.get("organizationId")

  try {
    // Fetch tags based on context
    // If organizationId is provided, fetch org-scoped tags
    // Otherwise, fetch personal tags (organizationId is null)
    const tags = await prisma.tag.findMany({
      where: {
        organizationId: organizationId || null,
        name: query ? {
          contains: query,
          mode: "insensitive",
        } : undefined,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { snippets: true },
        },
      },
      orderBy: [
        // Order by usage count (most used first)
        { snippets: { _count: "desc" } },
        // Then alphabetically
        { name: "asc" },
      ],
      take: 10,
    })

    return NextResponse.json(
      tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        count: tag._count.snippets,
      }))
    )
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
}
