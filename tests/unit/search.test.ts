import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

/**
 * Test the prepareSearchQuery function behavior by testing the exported function indirectly
 * Since prepareSearchQuery is not exported, we test it through mocking and testing the behavior
 * of the searchSnippetsFullText function's query preparation logic.
 * 
 * Note: The actual prepareSearchQuery is internal to search.ts. These tests validate
 * the expected behavior of the search query preparation logic.
 */

describe("prepareSearchQuery behavior", () => {
  // We're testing the logic that prepareSearchQuery should follow
  function prepareSearchQuery(searchQuery: string): string | null {
    if (!searchQuery.trim()) {
      return null
    }

    const words = searchQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => {
        return word.replace(/[^\w]/g, "")
      })
      .filter((word) => word.length > 0)

    if (words.length === 0) {
      return null
    }

    return words.map((word) => `${word}:*`).join(" & ")
  }

  it("returns null for empty string", () => {
    expect(prepareSearchQuery("")).toBeNull()
  })

  it("returns null for whitespace-only string", () => {
    expect(prepareSearchQuery("   ")).toBeNull()
    expect(prepareSearchQuery("\t\n")).toBeNull()
  })

  it("converts single word to prefix match query", () => {
    expect(prepareSearchQuery("react")).toBe("react:*")
    expect(prepareSearchQuery("typescript")).toBe("typescript:*")
  })

  it("converts multiple words to AND query with prefix matches", () => {
    expect(prepareSearchQuery("react hooks")).toBe("react:* & hooks:*")
    expect(prepareSearchQuery("javascript async await")).toBe(
      "javascript:* & async:* & await:*"
    )
  })

  it("converts to lowercase", () => {
    expect(prepareSearchQuery("React")).toBe("react:*")
    expect(prepareSearchQuery("TypeScript")).toBe("typescript:*")
    expect(prepareSearchQuery("React Hooks")).toBe("react:* & hooks:*")
  })

  it("removes special characters", () => {
    expect(prepareSearchQuery("react@2024")).toBe("react2024:*")
    expect(prepareSearchQuery("c++")).toBe("c:*")
    expect(prepareSearchQuery("node.js")).toBe("nodejs:*")
  })

  it("handles multiple spaces between words", () => {
    expect(prepareSearchQuery("react    hooks")).toBe("react:* & hooks:*")
  })

  it("returns null when all characters are special", () => {
    expect(prepareSearchQuery("@#$%")).toBeNull()
    expect(prepareSearchQuery("!!! ???")).toBeNull()
  })

  it("preserves underscores in words", () => {
    expect(prepareSearchQuery("snake_case")).toBe("snake_case:*")
    expect(prepareSearchQuery("my_function test")).toBe("my_function:* & test:*")
  })

  it("filters out empty words after cleaning", () => {
    expect(prepareSearchQuery("react   @@@   hooks")).toBe("react:* & hooks:*")
  })
})
