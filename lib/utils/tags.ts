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
  return prisma.tag.create({
    data: {
      name: normalizedName,
      organizationId: orgId,
    },
  })
}

