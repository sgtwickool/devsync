import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

/**
 * Generate a URL-safe slug from organization name
 */
export function generateOrganizationSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

/**
 * Validate and ensure slug uniqueness
 */
export async function validateOrganizationSlug(slug: string, excludeId?: string): Promise<{ valid: boolean; error?: string }> {
  if (!slug || slug.length < 2) {
    return { valid: false, error: "Slug must be at least 2 characters" }
  }
  
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: "Slug can only contain lowercase letters, numbers, and hyphens" }
  }
  
  // Check if slug already exists
  const existing = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true },
  })
  
  if (existing && existing.id !== excludeId) {
    return { valid: false, error: "This slug is already taken" }
  }
  
  return { valid: true }
}

/**
 * Get organization filter from search params
 * Returns: "personal" | organization slug | null (for "all")
 */
export function getOrganizationFilterFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): string | null {
  const orgParam = searchParams.org
  
  if (!orgParam) {
    return null // Show all
  }
  
  const org = Array.isArray(orgParam) ? orgParam[0] : orgParam
  
  if (org === "personal") {
    return "personal"
  }
  
  return org // Organization slug
}

/**
 * Get all organizations user is a member of
 */
export async function getUserAccessibleOrganizations(userId: string) {
  return prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      organization: {
        name: "asc",
      },
    },
  })
}

/**
 * Build Prisma where clause for unified snippet query
 * Returns snippets where:
 * - userId = currentUserId (personal snippets) OR
 * - organizationId IN (user's org memberships) AND visibility allows access
 */
export async function buildSnippetWhereClause(
  userId: string,
  orgFilter?: string | null
): Promise<Prisma.SnippetWhereInput> {
  // Get user's organization IDs
  const userOrgs = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true },
  })
  
  const orgIds = userOrgs.map((om) => om.organizationId)
  
  // Build base conditions
  const personalCondition: Prisma.SnippetWhereInput = {
    userId,
    organizationId: null, // Personal snippets
  }
  
  const orgCondition: Prisma.SnippetWhereInput = {
    organizationId: { in: orgIds },
    OR: [
      { visibility: "TEAM" }, // Team snippets visible to all members
      { userId, visibility: "PRIVATE" }, // Private snippets only visible to creator
    ],
  }
  
  // Apply organization filter
  if (orgFilter === "personal") {
    return personalCondition
  }
  
  if (orgFilter && orgFilter !== "personal") {
    // Filter by specific organization
    const org = await prisma.organization.findUnique({
      where: { slug: orgFilter },
      select: { id: true },
    })
    
    if (!org) {
      // Organization not found or user not a member, return empty result
      return { id: "non-existent" } // This will return no results
    }
    
    // Check if user is member of this org
    const isMember = orgIds.includes(org.id)
    if (!isMember) {
      return { id: "non-existent" } // Not a member, return empty result
    }
    
    return {
      organizationId: org.id,
      OR: [
        { visibility: "TEAM" },
        { userId, visibility: "PRIVATE" },
      ],
    }
  }
  
  // Show all (personal + org snippets)
  return {
    OR: [personalCondition, orgCondition],
  }
}
