"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { handleServerActionError } from "@/lib/utils/errors"
import { parseTagsFromFormData, getOrCreateTag } from "@/lib/utils/tags"
import { canUserAccessSnippet, canUserModifySnippet } from "@/lib/utils/permissions"
import type { CreateSnippetResult, UpdateResult, DeleteResult } from "@/lib/types/actions"

// Schema for snippet validation (used for both create and update)
const snippetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
}) satisfies z.ZodType<{
  title: string
  description?: string
  code: string
  language: string
}>

export async function createSnippet(formData: FormData): Promise<CreateSnippetResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      code: formData.get("code"),
      language: formData.get("language"),
      tags: formData.get("tags"),
      organizationId: formData.get("organizationId"),
      visibility: formData.get("visibility"),
    }

    // Validate all required fields are strings
    if (
      typeof rawData.title !== "string" ||
      typeof rawData.code !== "string" ||
      typeof rawData.language !== "string"
    ) {
      return { error: "Title, code, and language are required" }
    }

    const validated = snippetSchema.parse({
      title: rawData.title,
      description: typeof rawData.description === "string" ? rawData.description : undefined,
      code: rawData.code,
      language: rawData.language,
    }) satisfies { title: string; description?: string; code: string; language: string }

    // Handle organization and visibility
    const organizationId =
      typeof rawData.organizationId === "string" && rawData.organizationId !== ""
        ? rawData.organizationId
        : null
    
    const visibility =
      typeof rawData.visibility === "string"
        ? (rawData.visibility as "PRIVATE" | "TEAM" | "PUBLIC")
        : "PRIVATE"

    // If organization is provided, verify user is a member
    if (organizationId) {
      const isMember = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId,
          },
        },
      })

      if (!isMember) {
        return { error: "You are not a member of this organization" }
      }
    }

    // Parse and create tags (scoped to organization if provided)
    const tagNames = parseTagsFromFormData(rawData.tags)
    const snippet = await prisma.snippet.create({
      data: {
        title: validated.title,
        description: validated.description || null,
        code: validated.code,
        language: validated.language,
        userId: session.user.id,
        organizationId,
        visibility,
        tags: {
          create: await Promise.all(
            tagNames.map(async (tagName) => {
              const tag = await getOrCreateTag(prisma, tagName, organizationId)
              return { tagId: tag.id } as const
            })
          ),
        },
      },
    })

    revalidatePath("/dashboard")
    return { success: true, snippetId: snippet.id }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

export async function deleteSnippet(snippetId: string): Promise<DeleteResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Verify snippet exists and user can delete it
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
    })

    if (!snippet) {
      return { error: "Snippet not found" }
    }

    const canModify = await canUserModifySnippet(session.user.id, snippet)
    if (!canModify) {
      return { error: "Unauthorized" }
    }

    await prisma.snippet.delete({
      where: { id: snippetId },
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

export async function updateSnippet(snippetId: string, formData: FormData): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Verify snippet exists and user can modify it
    const existingSnippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      include: { 
        tags: { include: { tag: true } },
        collections: true,
      },
    })

    if (!existingSnippet) {
      return { error: "Snippet not found" }
    }

    const canModify = await canUserModifySnippet(session.user.id, existingSnippet)
    if (!canModify) {
      return { error: "Unauthorized" }
    }

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      code: formData.get("code"),
      language: formData.get("language"),
      tags: formData.get("tags"),
      visibility: formData.get("visibility"),
      organizationId: formData.get("organizationId"),
    }

    // Validate all required fields are strings
    if (
      typeof rawData.title !== "string" ||
      typeof rawData.code !== "string" ||
      typeof rawData.language !== "string"
    ) {
      return { error: "Title, code, and language are required" }
    }

    const validated = snippetSchema.parse({
      title: rawData.title,
      description: typeof rawData.description === "string" ? rawData.description : undefined,
      code: rawData.code,
      language: rawData.language,
    }) satisfies { title: string; description?: string; code: string; language: string }

    const visibility =
      typeof rawData.visibility === "string"
        ? (rawData.visibility as "PRIVATE" | "TEAM" | "PUBLIC")
        : existingSnippet.visibility

    // Handle organization promotion (one-way: personal -> org)
    let newOrganizationId = existingSnippet.organizationId
    const requestedOrgId = typeof rawData.organizationId === "string" && rawData.organizationId !== "" 
      ? rawData.organizationId 
      : null

    if (requestedOrgId && existingSnippet.organizationId === null) {
      // Promoting personal snippet to organization
      // Verify user is a member of the target organization
      const isMember = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId: requestedOrgId,
          },
        },
      })

      if (!isMember) {
        return { error: "You are not a member of this organization" }
      }

      newOrganizationId = requestedOrgId

      // Remove from any personal collections (collections are org-scoped)
      if (existingSnippet.collections.length > 0) {
        await prisma.snippetCollection.deleteMany({
          where: { snippetId },
        })
      }

      // Remove existing tag associations (we'll recreate them in the new org context)
      await prisma.snippetTag.deleteMany({
        where: { snippetId },
      })
    } else if (requestedOrgId && existingSnippet.organizationId !== null) {
      // Trying to change organization - not allowed
      return { error: "Cannot move snippet between organizations" }
    }

    // Parse tags
    const tagNames = parseTagsFromFormData(rawData.tags)

    // Update snippet
    await prisma.snippet.update({
      where: { id: snippetId },
      data: {
        title: validated.title,
        description: validated.description || null,
        code: validated.code,
        language: validated.language,
        visibility,
        organizationId: newOrganizationId,
      },
    })

    // Handle tags based on whether we're promoting or just updating
    if (requestedOrgId && existingSnippet.organizationId === null) {
      // Promoting: create all tags fresh in the new org context
      await Promise.all(
        tagNames.map(async (tagName) => {
          const tag = await getOrCreateTag(prisma, tagName, newOrganizationId)
          await prisma.snippetTag.create({
            data: { snippetId, tagId: tag.id },
          })
        })
      )
    } else {
      // Normal update: add/remove tags as needed
      const currentTagNames = existingSnippet.tags.map((st) => st.tag.name)
      const tagsToAdd = tagNames.filter((t) => !currentTagNames.includes(t))
      const tagsToRemove = currentTagNames.filter((t) => !tagNames.includes(t))

      // Add new tags
      await Promise.all(
        tagsToAdd.map(async (tagName) => {
          const tag = await getOrCreateTag(prisma, tagName, existingSnippet.organizationId)
          await prisma.snippetTag.create({
            data: { snippetId, tagId: tag.id },
          })
        })
      )

      // Remove tags
      await Promise.all(
        tagsToRemove.map(async (tagName) => {
          const tag = await prisma.tag.findFirst({
            where: {
              name: tagName,
              organizationId: existingSnippet.organizationId,
            },
          })
          if (tag) {
            await prisma.snippetTag.delete({
              where: { snippetId_tagId: { snippetId, tagId: tag.id } },
            })
          }
        })
      )
    }

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/snippets/${snippetId}`)
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

