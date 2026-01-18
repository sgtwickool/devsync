/**
 * Utility functions for tag processing
 */

import type { PrismaClient } from "@prisma/client"

/**
 * Normalizes a tag name by removing # prefix, trimming, and lowercasing
 */
export function normalizeTag(tagName: string): string {
  return tagName.replace(/^#+/, "").trim().toLowerCase()
}

/**
 * Parses tags from FormData (supports JSON array or comma-separated string)
 */
export function parseTagsFromFormData(tags: FormDataEntryValue | null): string[] {
  if (!tags || typeof tags !== "string") {
    return []
  }

  try {
    const parsed = JSON.parse(tags)
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeTag).filter((t) => t.length > 0)
    }
  } catch {
    // Not JSON, treat as comma-separated
  }

  return tags
    .split(",")
    .map(normalizeTag)
    .filter((t) => t.length > 0)
}

/**
 * Creates or finds a tag by name, scoped to organization if provided
 * Uses findFirst + create pattern because Prisma's upsert doesn't work well
 * with compound unique keys that have nullable fields
 * 
 * Handles race conditions by catching unique constraint violations and retrying
 */
export async function getOrCreateTag(
  prisma: PrismaClient,
  tagName: string,
  organizationId?: string | null
): Promise<{ id: string; name: string }> {
  const normalizedName = normalizeTag(tagName)
  const orgId = organizationId || null
  
  // First try to find existing tag
  const existingTag = await prisma.tag.findFirst({
    where: {
      name: normalizedName,
      organizationId: orgId,
    },
  })

  if (existingTag) {
    return existingTag
  }

  // Create new tag if it doesn't exist
  // Handle race condition: if another request created the tag between
  // our findFirst and create, catch the unique constraint error and find it
  try {
    return await prisma.tag.create({
      data: {
        name: normalizedName,
        organizationId: orgId,
      },
    })
  } catch (error) {
    // Check if it's a unique constraint violation (P2002 in Prisma)
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      // Tag was created by another request, find and return it
      const tag = await prisma.tag.findFirst({
        where: {
          name: normalizedName,
          organizationId: orgId,
        },
      })
      if (tag) {
        return tag
      }
    }
    // Re-throw if it's a different error
    throw error
  }
}

