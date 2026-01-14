"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { handleServerActionError } from "@/lib/utils/errors"
import {
  generateOrganizationSlug,
  validateOrganizationSlug,
} from "@/lib/utils/organization"
import {
  canUserCreateWorkspace,
  canOrganizationAddMember,
  getMemberLimit,
} from "@/lib/utils/subscription"
import {
  hasOrganizationPermission,
  getUserRoleInOrganization,
} from "@/lib/utils/permissions"
import { sendInviteEmail } from "@/lib/utils/email"
import type {
  CreateResult,
  UpdateResult,
  DeleteResult,
} from "@/lib/types/actions"
import type { MemberRole } from "@prisma/client"

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
}) satisfies z.ZodType<{
  name: string
}>

const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
}) satisfies z.ZodType<{
  name: string
  slug: string
}>

/**
 * Create a new organization
 */
export async function createOrganization(
  formData: FormData
): Promise<CreateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const rawData = {
      name: formData.get("name"),
    }

    if (typeof rawData.name !== "string") {
      return { error: "Name is required" }
    }

    const validated = createOrganizationSchema.parse(rawData)

    // Check workspace limit
    const canCreate = await canUserCreateWorkspace(session.user.id)
    if (!canCreate) {
      return {
        error: "Workspace limit reached. Upgrade to PRO for unlimited workspaces.",
      }
    }

    // Generate and validate slug
    const slug = generateOrganizationSlug(validated.name)
    const slugValidation = await validateOrganizationSlug(slug)
    
    if (!slugValidation.valid) {
      return { error: slugValidation.error || "Invalid slug" }
    }

    // Create organization and add user as OWNER
    const organization = await prisma.organization.create({
      data: {
        name: validated.name,
        slug,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
    })

    revalidatePath("/dashboard/organizations")
    revalidatePath("/dashboard")
    
    return { success: true, id: organization.id }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

/**
 * Update organization
 */
export async function updateOrganization(
  organizationId: string,
  formData: FormData
): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Check permission (OWNER or ADMIN)
    const hasPermission = await hasOrganizationPermission(
      session.user.id,
      organizationId,
      "ADMIN"
    )

    if (!hasPermission) {
      return { error: "You don't have permission to update this organization" }
    }

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
    }

    if (typeof rawData.name !== "string" || typeof rawData.slug !== "string") {
      return { error: "Name and slug are required" }
    }

    const validated = updateOrganizationSchema.parse(rawData)

    // Validate slug uniqueness (excluding current org)
    const slugValidation = await validateOrganizationSlug(
      validated.slug,
      organizationId
    )
    
    if (!slugValidation.valid) {
      return { error: slugValidation.error || "Invalid slug" }
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: validated.name,
        slug: validated.slug,
      },
    })

    revalidatePath(`/dashboard/organizations/${validated.slug}`)
    revalidatePath("/dashboard/organizations")
    revalidatePath("/dashboard")
    
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

/**
 * Delete organization (OWNER only)
 */
export async function deleteOrganization(
  organizationId: string
): Promise<DeleteResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Check permission (OWNER only)
    const hasPermission = await hasOrganizationPermission(
      session.user.id,
      organizationId,
      "OWNER"
    )

    if (!hasPermission) {
      return { error: "Only the organization owner can delete it" }
    }

    await prisma.organization.delete({
      where: { id: organizationId },
    })

    revalidatePath("/dashboard/organizations")
    revalidatePath("/dashboard")
    
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

/**
 * Get all organizations user belongs to
 */
export async function getUserOrganizations(userId: string) {
  return prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          _count: {
            select: {
              members: true,
              snippets: true,
              collections: true,
            },
          },
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
 * Get organization members
 */
export async function getOrganizationMembers(organizationId: string) {
  return prisma.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: [
      { role: "asc" }, // OWNER first, then ADMIN, then MEMBER
      { joinedAt: "asc" },
    ],
  })
}

/**
 * Check workspace limit for user
 */
export async function checkWorkspaceLimit(userId: string): Promise<{
  canCreate: boolean
  currentCount: number
  limit: number | null
  error?: string
}> {
  const canCreate = await canUserCreateWorkspace(userId)
  
  const currentCount = await prisma.organizationMember.count({
    where: {
      userId,
      role: "OWNER",
    },
  })
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  })
  
  const limit = user?.subscriptionTier === "PRO" ? null : 1
  
  if (!canCreate) {
    return {
      canCreate: false,
      currentCount,
      limit,
      error: "Workspace limit reached. Upgrade to PRO for unlimited workspaces.",
    }
  }
  
  return { canCreate: true, currentCount, limit }
}

/**
 * Check member limit for organization
 */
export async function checkMemberLimit(organizationId: string): Promise<{
  canAdd: boolean
  currentCount: number
  pendingInvites: number
  limit: number | null
  error?: string
}> {
  const canAdd = await canOrganizationAddMember(organizationId)
  
  const currentCount = await prisma.organizationMember.count({
    where: { organizationId },
  })
  
  const pendingInvites = await prisma.organizationInvite.count({
    where: {
      organizationId,
      expiresAt: { gt: new Date() },
    },
  })
  
  const limit = await getMemberLimit(organizationId)
  
  if (!canAdd) {
    return {
      canAdd: false,
      currentCount,
      pendingInvites,
      limit,
      error: "Member limit reached. Upgrade to PRO for unlimited members.",
    }
  }
  
  return { canAdd: true, currentCount, pendingInvites, limit }
}

/**
 * Invite a member to organization
 */
export async function inviteMember(
  organizationId: string,
  formData: FormData
): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Check permission (ADMIN or OWNER)
    const hasPermission = await hasOrganizationPermission(
      session.user.id,
      organizationId,
      "ADMIN"
    )

    if (!hasPermission) {
      return { error: "You don't have permission to invite members" }
    }

    const rawData = {
      email: formData.get("email"),
      role: formData.get("role"),
    }

    if (typeof rawData.email !== "string" || typeof rawData.role !== "string") {
      return { error: "Email and role are required" }
    }

    const email = rawData.email.toLowerCase().trim()
    const role = rawData.role as MemberRole

    if (!["OWNER", "ADMIN", "MEMBER"].includes(role)) {
      return { error: "Invalid role" }
    }

    // Don't allow inviting as OWNER (only existing owner can transfer)
    if (role === "OWNER") {
      return { error: "Cannot invite as owner" }
    }

    // Check member limit
    const limitCheck = await checkMemberLimit(organizationId)
    if (!limitCheck.canAdd) {
      return { error: limitCheck.error || "Member limit reached" }
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: { email },
      },
    })

    if (existingMember) {
      return { error: "User is already a member of this organization" }
    }

    // Check if there's already a pending invite
    const existingInvite = await prisma.organizationInvite.findUnique({
      where: {
        email_organizationId: {
          email,
          organizationId,
        },
      },
    })

    if (existingInvite && existingInvite.expiresAt > new Date()) {
      return { error: "An invitation has already been sent to this email" }
    }

    // Create or update invite (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Get organization and inviter details for email
    const [organization, inviter] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { name: true, slug: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
      }),
    ])

    if (!organization || !inviter) {
      return { error: "Organization or user not found" }
    }

    // Create or update invite
    const invite = await prisma.organizationInvite.upsert({
      where: {
        email_organizationId: {
          email,
          organizationId,
        },
      },
      create: {
        email,
        role,
        organizationId,
        invitedById: session.user.id,
        expiresAt,
      },
      update: {
        role,
        expiresAt,
        invitedById: session.user.id,
      },
      select: {
        token: true,
      },
    })

    // Send invitation email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const inviteLink = `${baseUrl}/invite/${invite.token}`

    const emailResult = await sendInviteEmail({
      to: email,
      organizationName: organization.name,
      inviterName: inviter.name,
      inviterEmail: inviter.email,
      role,
      inviteLink,
    })

    // Log email result but don't fail the invite creation if email fails
    if (!emailResult.success) {
      console.error("[Invite] Failed to send email:", emailResult.error)
      // Continue anyway - the invite is created and can be accessed via link
    }

    revalidatePath(`/dashboard/organizations/${organizationId}/members`)
    revalidatePath(`/dashboard/organizations/${organizationId}/settings`)
    
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

/**
 * Accept invitation
 */
export async function acceptInvite(token: string): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    })

    if (!invite) {
      return { error: "Invitation not found" }
    }

    if (invite.expiresAt < new Date()) {
      return { error: "This invitation has expired" }
    }

    // Check if email matches
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return { error: "This invitation was sent to a different email address" }
    }

    // Check if already a member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: invite.organizationId,
        },
      },
    })

    if (existingMember) {
      // Delete the invite since user is already a member
      await prisma.organizationInvite.delete({
        where: { id: invite.id },
      })
      return { error: "You are already a member of this organization" }
    }

    // Check member limit before accepting
    const limitCheck = await checkMemberLimit(invite.organizationId)
    if (!limitCheck.canAdd) {
      return { error: limitCheck.error || "Member limit reached" }
    }

    // Create membership and delete invite
    await prisma.$transaction([
      prisma.organizationMember.create({
        data: {
          userId: session.user.id,
          organizationId: invite.organizationId,
          role: invite.role,
        },
      }),
      prisma.organizationInvite.delete({
        where: { id: invite.id },
      }),
    ])

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/organizations")
    
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

/**
 * Decline invitation
 */
export async function declineInvite(token: string): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
    })

    if (!invite) {
      return { error: "Invitation not found" }
    }

    // Check if email matches
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return { error: "This invitation was sent to a different email address" }
    }

    await prisma.organizationInvite.delete({
      where: { id: invite.id },
    })

    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

/**
 * Revoke invitation
 */
export async function revokeInvite(inviteId: string): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const invite = await prisma.organizationInvite.findUnique({
      where: { id: inviteId },
      include: {
        organization: true,
      },
    })

    if (!invite) {
      return { error: "Invitation not found" }
    }

    // Check permission (ADMIN or OWNER)
    const hasPermission = await hasOrganizationPermission(
      session.user.id,
      invite.organizationId,
      "ADMIN"
    )

    if (!hasPermission) {
      return { error: "You don't have permission to revoke this invitation" }
    }

    await prisma.organizationInvite.delete({
      where: { id: inviteId },
    })

    revalidatePath(`/dashboard/organizations/${invite.organizationId}/members`)
    revalidatePath(`/dashboard/organizations/${invite.organizationId}/settings`)
    
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

/**
 * Remove member from organization
 */
export async function removeMember(
  organizationId: string,
  userId: string
): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Check permission (ADMIN or OWNER)
    const hasPermission = await hasOrganizationPermission(
      session.user.id,
      organizationId,
      "ADMIN"
    )

    if (!hasPermission) {
      return { error: "You don't have permission to remove members" }
    }

    // Don't allow removing the owner
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    })

    if (!member) {
      return { error: "Member not found" }
    }

    if (member.role === "OWNER") {
      return { error: "Cannot remove the organization owner" }
    }

    await prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    })

    revalidatePath(`/dashboard/organizations/${organizationId}/members`)
    revalidatePath(`/dashboard/organizations/${organizationId}/settings`)
    
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

/**
 * Update member role (OWNER only)
 */
export async function updateMemberRole(
  organizationId: string,
  userId: string,
  newRole: MemberRole
): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Check permission (OWNER only)
    const hasPermission = await hasOrganizationPermission(
      session.user.id,
      organizationId,
      "OWNER"
    )

    if (!hasPermission) {
      return { error: "Only the organization owner can change member roles" }
    }

    if (!["OWNER", "ADMIN", "MEMBER"].includes(newRole)) {
      return { error: "Invalid role" }
    }

    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    })

    if (!member) {
      return { error: "Member not found" }
    }

    // If transferring ownership, the current owner becomes ADMIN
    if (newRole === "OWNER" && member.role !== "OWNER") {
      await prisma.$transaction([
        prisma.organizationMember.update({
          where: {
            userId_organizationId: {
              userId: session.user.id,
              organizationId,
            },
          },
          data: { role: "ADMIN" },
        }),
        prisma.organizationMember.update({
          where: {
            userId_organizationId: {
              userId,
              organizationId,
            },
          },
          data: { role: "OWNER" },
        }),
      ])
    } else {
      await prisma.organizationMember.update({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
        data: { role: newRole },
      })
    }

    revalidatePath(`/dashboard/organizations/${organizationId}/members`)
    revalidatePath(`/dashboard/organizations/${organizationId}/settings`)
    
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

/**
 * Get pending invites for an organization
 */
export async function getOrganizationInvites(organizationId: string) {
  return prisma.organizationInvite.findMany({
    where: {
      organizationId,
      expiresAt: { gt: new Date() }, // Only non-expired invites
    },
    include: {
      invitedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
