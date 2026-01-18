"use server"

import { prisma } from "@/lib/prisma"
import type { Snippet, MemberRole } from "@prisma/client"

/**
 * Get user's role in an organization
 */
export async function getUserRoleInOrganization(
  userId: string,
  organizationId: string
): Promise<MemberRole | null> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    select: { role: true },
  })
  
  return membership?.role || null
}

/**
 * Check if user has required permission in organization
 */
export async function hasOrganizationPermission(
  userId: string,
  organizationId: string,
  requiredRole: MemberRole
): Promise<boolean> {
  const userRole = await getUserRoleInOrganization(userId, organizationId)
  
  if (!userRole) {
    return false
  }
  
  // Role hierarchy: OWNER > ADMIN > MEMBER
  const roleHierarchy: Record<MemberRole, number> = {
    OWNER: 3,
    ADMIN: 2,
    MEMBER: 1,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if user can access a snippet
 */
export async function canUserAccessSnippet(
  userId: string,
  snippet: Snippet
): Promise<boolean> {
  // PUBLIC snippets are visible to everyone (regardless of org)
  if (snippet.visibility === "PUBLIC") {
    return true
  }
  
  // Personal snippet (no organization)
  if (!snippet.organizationId) {
    // Only creator can access non-public personal snippets
    return snippet.userId === userId
  }
  
  // Organization snippet
  if (snippet.visibility === "PRIVATE") {
    // Private snippets only visible to creator
    return snippet.userId === userId
  }
  
  if (snippet.visibility === "TEAM") {
    // Team snippets visible to all org members
    const isMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: snippet.organizationId,
        },
      },
    })
    
    return !!isMember
  }
  
  return false
}

/**
 * Check if user can modify a snippet
 */
export async function canUserModifySnippet(
  userId: string,
  snippet: Snippet
): Promise<boolean> {
  // Only creator can modify
  return snippet.userId === userId
}
