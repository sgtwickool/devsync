"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { handleServerActionError } from "@/lib/utils/errors"
import type { UpdateResult } from "@/lib/types/actions"

/**
 * Add tags to a snippet
 * Tags are created if they don't exist (global tags, not user-specific)
 */
export async function addTagsToSnippet(snippetId: string, tagNames: string[]): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Verify snippet belongs to user
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: { userId: true },
    })

    if (!snippet) {
      return { error: "Snippet not found" }
    }

    if (snippet.userId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    // Process each tag
    for (const tagName of tagNames) {
      const trimmedName = tagName.trim().toLowerCase()
      if (!trimmedName) continue

      // Find or create tag
      const tag = await prisma.tag.upsert({
        where: { name: trimmedName },
        update: {},
        create: { name: trimmedName },
      })

      // Create snippet-tag relationship if it doesn't exist
      await prisma.snippetTag.upsert({
        where: {
          snippetId_tagId: {
            snippetId,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          snippetId,
          tagId: tag.id,
        },
      })
    }

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/snippets/${snippetId}`)
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

/**
 * Remove a tag from a snippet
 */
export async function removeTagFromSnippet(snippetId: string, tagId: string): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Verify snippet belongs to user
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: { userId: true },
    })

    if (!snippet) {
      return { error: "Snippet not found" }
    }

    if (snippet.userId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    // Remove the tag relationship
    await prisma.snippetTag.delete({
      where: {
        snippetId_tagId: {
          snippetId,
          tagId,
        },
      },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/snippets/${snippetId}`)
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

