/**
 * Utility functions for tag processing
 */

import type { PrismaClient } from "@prisma/client"

/**
 * Normalizes a tag name by removing # prefix, trimming, and lowercasing
 */
export function normalizeTagName(tagName: string): string {
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
      return parsed.map(normalizeTagName).filter((t) => t.length > 0)
    }
  } catch {
    // Not JSON, treat as comma-separated
  }

  return tags
    .split(",")
    .map(normalizeTagName)
    .filter((t) => t.length > 0)
}

/**
 * Creates or finds a tag by name
 */
export async function getOrCreateTag(prisma: PrismaClient, tagName: string) {
  return prisma.tag.upsert({
    where: { name: tagName },
    update: {},
    create: { name: tagName },
  })
}

