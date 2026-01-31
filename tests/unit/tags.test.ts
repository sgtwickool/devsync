import { describe, it, expect } from "vitest"
import { normalizeTag, parseTagsFromFormData } from "@/lib/utils/tags"

describe("normalizeTag", () => {
  it("removes leading # symbols", () => {
    expect(normalizeTag("#javascript")).toBe("javascript")
    expect(normalizeTag("##react")).toBe("react")
    expect(normalizeTag("###typescript")).toBe("typescript")
  })

  it("trims whitespace", () => {
    expect(normalizeTag("  react  ")).toBe("react")
    expect(normalizeTag("\treact\n")).toBe("react")
  })

  it("converts to lowercase", () => {
    expect(normalizeTag("JavaScript")).toBe("javascript")
    expect(normalizeTag("REACT")).toBe("react")
    expect(normalizeTag("TypeScript")).toBe("typescript")
  })

  it("handles combined cases", () => {
    expect(normalizeTag("#  TypeScript  ")).toBe("typescript")
    expect(normalizeTag("##  REACT  ")).toBe("react")
  })

  it("handles empty strings", () => {
    expect(normalizeTag("")).toBe("")
    expect(normalizeTag("   ")).toBe("")
    expect(normalizeTag("###")).toBe("")
  })

  it("preserves hyphens and underscores in tag names", () => {
    expect(normalizeTag("react-native")).toBe("react-native")
    expect(normalizeTag("node_js")).toBe("node_js")
  })
})

describe("parseTagsFromFormData", () => {
  it("returns empty array for null input", () => {
    expect(parseTagsFromFormData(null)).toEqual([])
  })

  it("returns empty array for non-string input", () => {
    // FormDataEntryValue can be a File, which should return empty array
    expect(parseTagsFromFormData(new File([], "test.txt"))).toEqual([])
  })

  it("parses JSON array of tags", () => {
    const tags = JSON.stringify(["react", "typescript", "nextjs"])
    expect(parseTagsFromFormData(tags)).toEqual(["react", "typescript", "nextjs"])
  })

  it("normalizes tags from JSON array", () => {
    const tags = JSON.stringify(["#React", "  TypeScript  ", "##NextJS"])
    expect(parseTagsFromFormData(tags)).toEqual(["react", "typescript", "nextjs"])
  })

  it("parses comma-separated string", () => {
    expect(parseTagsFromFormData("react, typescript, nextjs")).toEqual([
      "react",
      "typescript",
      "nextjs",
    ])
  })

  it("normalizes comma-separated tags", () => {
    // Note: The function normalizes and splits by comma. Leading # is removed, whitespace trimmed, and lowercased.
    expect(parseTagsFromFormData("#React, TypeScript, NextJS")).toEqual([
      "react",
      "typescript",
      "nextjs",
    ])
  })

  it("filters out empty tags", () => {
    expect(parseTagsFromFormData("react,, typescript, ,nextjs")).toEqual([
      "react",
      "typescript",
      "nextjs",
    ])
  })

  it("handles empty JSON array", () => {
    expect(parseTagsFromFormData("[]")).toEqual([])
  })

  it("handles empty string", () => {
    expect(parseTagsFromFormData("")).toEqual([])
  })

  it("handles JSON array with only empty/hash tags", () => {
    const tags = JSON.stringify(["#", "  ", "###"])
    expect(parseTagsFromFormData(tags)).toEqual([])
  })
})
