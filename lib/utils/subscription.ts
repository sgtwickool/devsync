"use server"

import { prisma } from "@/lib/prisma"
import type { SubscriptionTier } from "@prisma/client"

/**
 * Get user's subscription tier
 */
export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  })
  
  return user?.subscriptionTier || "FREE"
}

/**
 * Check if user can create another workspace
 */
export async function canUserCreateWorkspace(userId: string): Promise<boolean> {
  const tier = await getUserSubscriptionTier(userId)
  
  if (tier === "PRO") {
    return true // Unlimited for PRO
  }
  
  // FREE tier: check if user already has a workspace
  const orgCount = await prisma.organizationMember.count({
    where: {
      userId,
      role: "OWNER", // Only count orgs where user is owner
    },
  })
  
  return orgCount < 1
}

/**
 * Get workspace limit for user's tier
 */
export async function getWorkspaceLimit(userId: string): Promise<number | null> {
  const tier = await getUserSubscriptionTier(userId)
  
  if (tier === "PRO") {
    return null // Unlimited
  }
  
  return 1 // FREE tier limit
}

/**
 * Check if organization can add more members
 */
export async function canOrganizationAddMember(organizationId: string): Promise<boolean> {
  // Get the organization owner's tier
  const owner = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      role: "OWNER",
    },
    include: {
      user: {
        select: { subscriptionTier: true },
      },
    },
  })
  
  if (!owner) {
    return false
  }
  
  const tier = owner.user.subscriptionTier
  
  if (tier === "PRO") {
    return true // Unlimited for PRO
  }
  
  // FREE tier: check current member count (including pending invites)
  const memberCount = await prisma.organizationMember.count({
    where: { organizationId },
  })
  
  const inviteCount = await prisma.organizationInvite.count({
    where: {
      organizationId,
      expiresAt: { gt: new Date() }, // Only count non-expired invites
    },
  })
  
  const totalCount = memberCount + inviteCount
  
  return totalCount < 5 // FREE tier limit is 5 members
}

/**
 * Get member limit for organization based on owner's tier
 */
export async function getMemberLimit(organizationId: string): Promise<number | null> {
  const owner = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      role: "OWNER",
    },
    include: {
      user: {
        select: { subscriptionTier: true },
      },
    },
  })
  
  if (!owner) {
    return 0
  }
  
  const tier = owner.user.subscriptionTier
  
  if (tier === "PRO") {
    return null // Unlimited
  }
  
  return 5 // FREE tier limit
}

/**
 * Get organization owner's subscription tier
 */
export async function getOrganizationOwnerTier(organizationId: string): Promise<SubscriptionTier> {
  const owner = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      role: "OWNER",
    },
    include: {
      user: {
        select: { subscriptionTier: true },
      },
    },
  })
  
  return owner?.user.subscriptionTier || "FREE"
}
