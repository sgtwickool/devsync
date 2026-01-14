import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Prepare search query for PostgreSQL full-text search
 * Converts user input into a proper tsquery format with proper escaping
 * 
 * Uses prefix matching to allow partial word matches (e.g., "react" matches "reactjs")
 * Properly escapes special characters to prevent tsquery syntax errors
 * 
 * @param searchQuery - Raw user input
 * @returns Escaped tsquery string or null if invalid
 */
function prepareSearchQuery(searchQuery: string): string | null {
  if (!searchQuery.trim()) {
    return null
  }

  // Split into words and clean them
  const words = searchQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => {
      // Remove special characters but keep alphanumeric and underscores
      // This prevents tsquery syntax errors from invalid characters
      return word.replace(/[^\w]/g, "")
    })
    .filter((word) => word.length > 0)

  if (words.length === 0) {
    return null
  }

  // Build tsquery with prefix matching for each word
  // Use & (AND) to require all words, :* for prefix matching
  // This allows "react" to match "react", "reactjs", "react-native", etc.
  // Since we've already removed special chars, we don't need additional escaping
  return words.map((word) => `${word}:*`).join(" & ")
}


/**
 * Perform full-text search using PostgreSQL's native full-text search
 * Returns snippet IDs that match the search query, ordered by relevance
 * 
 * Uses Prisma.sql template literals for safe SQL query construction
 * 
 * @param searchQuery - User search input
 * @param baseWhere - Prisma where clause for access control
 * @returns Array of snippet IDs matching the search, ordered by relevance
 */
export async function searchSnippetsFullText(
  searchQuery: string,
  baseWhere: Prisma.SnippetWhereInput
): Promise<string[]> {
  const tsQuery = prepareSearchQuery(searchQuery)
  if (!tsQuery) {
    return []
  }

  try {
    // First, get the snippet IDs that match the access control conditions
    // This ensures we only search snippets the user has access to
    const accessibleSnippets = await prisma.snippet.findMany({
      where: baseWhere,
      select: { id: true },
      take: 10000, // Reasonable limit for access control filtering
    })

    if (accessibleSnippets.length === 0) {
      return []
    }

    const accessibleIds = accessibleSnippets.map((s) => s.id)

    // Use Prisma.sql for safe parameterized queries
    // This prevents SQL injection while allowing us to use PostgreSQL's full-text search
    const results = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "Snippet"
      WHERE id = ANY(${accessibleIds}::text[])
        AND search_vector @@ to_tsquery('english', ${tsQuery})
      ORDER BY 
        ts_rank(search_vector, to_tsquery('english', ${tsQuery})) DESC,
        "updatedAt" DESC
      LIMIT 1000
    `

    return results.map((r) => r.id)
  } catch (error) {
    // Check if error is due to missing search_vector column
    if (
      error instanceof Error &&
      (error.message.includes("search_vector") ||
        error.message.includes("column") ||
        error.message.includes("does not exist"))
    ) {
      console.warn(
        "Full-text search not available: search_vector column missing. Run the migration: prisma/migrations/add_fulltext_search.sql"
      )
      return []
    }

    // Log other errors for debugging
    console.error("Full-text search error:", error)
    return []
  }
}

/**
 * Search snippets with full-text search, including tag matching
 * Combines full-text search on snippet content with tag name search
 * 
 * This function:
 * 1. Performs full-text search on snippet content (title, description, code, language)
 * 2. Searches tag names using case-insensitive contains
 * 3. Combines both result sets
 * 4. Returns a Prisma where clause that can be used with other queries
 * 
 * @param searchQuery - User search input
 * @param baseWhere - Prisma where clause for access control
 * @returns Prisma where clause matching snippets that contain the search query
 */
export async function searchSnippetsComprehensive(
  searchQuery: string,
  baseWhere: Prisma.SnippetWhereInput
): Promise<Prisma.SnippetWhereInput> {
  if (!searchQuery.trim()) {
    return baseWhere
  }

  // Perform both searches in parallel for better performance
  const [fullTextIds, tagSnippets] = await Promise.all([
    searchSnippetsFullText(searchQuery, baseWhere),
    // Search tags using Prisma's contains (simpler and works well for tag names)
    prisma.snippet.findMany({
      where: {
        ...baseWhere,
        tags: {
          some: {
            tag: {
              name: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
          },
        },
      },
      select: { id: true },
    }),
  ])

  const tagIds = tagSnippets.map((s) => s.id)

  // Combine both result sets (full-text search + tag search)
  const allIds = [...new Set([...fullTextIds, ...tagIds])]

  if (allIds.length === 0) {
    // No results - return condition that matches nothing
    // Using a non-existent ID is safer than an empty array
    return {
      ...baseWhere,
      id: "non-existent-id-that-will-never-match-12345",
    }
  }

  // Return where clause matching found IDs
  // This can be combined with other where conditions (like tag filters)
  return {
    ...baseWhere,
    id: {
      in: allIds,
    },
  }
}
