import { describe, it, expect } from "vitest"
import {
  getCodeMirrorLanguage,
  getShikiLanguage,
  getLanguageBadgeClasses,
  LANGUAGE_CONFIG,
  LANGUAGES,
} from "@/lib/constants/languages"

describe("getCodeMirrorLanguage", () => {
  it("returns correct codemirror identifier for supported languages", () => {
    expect(getCodeMirrorLanguage("JavaScript")).toBe("javascript")
    expect(getCodeMirrorLanguage("TypeScript")).toBe("typescript")
    expect(getCodeMirrorLanguage("Python")).toBe("python")
    expect(getCodeMirrorLanguage("Java")).toBe("java")
    expect(getCodeMirrorLanguage("C++")).toBe("cpp")
    expect(getCodeMirrorLanguage("SQL")).toBe("sql")
  })

  it("returns javascript as fallback for unsupported languages", () => {
    expect(getCodeMirrorLanguage("Go")).toBe("javascript") // Go has null codemirror
    expect(getCodeMirrorLanguage("Ruby")).toBe("javascript")
    expect(getCodeMirrorLanguage("Haskell")).toBe("javascript")
  })

  it("returns javascript for unknown languages", () => {
    expect(getCodeMirrorLanguage("NonExistentLanguage")).toBe("javascript")
    expect(getCodeMirrorLanguage("")).toBe("javascript")
  })

  it("handles React/JSX correctly", () => {
    expect(getCodeMirrorLanguage("React")).toBe("react")
  })
})

describe("getShikiLanguage", () => {
  it("returns correct shiki identifier for supported languages", () => {
    expect(getShikiLanguage("JavaScript")).toBe("javascript")
    expect(getShikiLanguage("TypeScript")).toBe("typescript")
    expect(getShikiLanguage("Python")).toBe("python")
    expect(getShikiLanguage("Go")).toBe("go")
    expect(getShikiLanguage("Rust")).toBe("rust")
  })

  it("returns lowercase language name for unknown languages", () => {
    expect(getShikiLanguage("SomeNewLanguage")).toBe("somenewlanguage")
  })

  it("returns 'text' for empty string", () => {
    expect(getShikiLanguage("")).toBe("text")
  })

  it("handles special mappings correctly", () => {
    expect(getShikiLanguage("React")).toBe("tsx")
    expect(getShikiLanguage("Shell")).toBe("shellscript")
    expect(getShikiLanguage("Terraform")).toBe("hcl")
    expect(getShikiLanguage("C")).toBe("c")
  })
})

describe("getLanguageBadgeClasses", () => {
  it("returns correct badge classes for JavaScript", () => {
    const classes = getLanguageBadgeClasses("JavaScript")
    expect(classes).toContain("bg-yellow-100")
    expect(classes).toContain("text-yellow-800")
    expect(classes).toContain("border-yellow-200")
  })

  it("returns correct badge classes for TypeScript", () => {
    const classes = getLanguageBadgeClasses("TypeScript")
    expect(classes).toContain("bg-blue-100")
    expect(classes).toContain("text-blue-800")
    expect(classes).toContain("border-blue-200")
  })

  it("returns correct badge classes for Python", () => {
    const classes = getLanguageBadgeClasses("Python")
    expect(classes).toContain("bg-green-100")
    expect(classes).toContain("text-green-800")
    expect(classes).toContain("border-green-200")
  })

  it("returns Other badge classes for unknown languages", () => {
    const unknownClasses = getLanguageBadgeClasses("UnknownLanguage")
    const otherClasses = LANGUAGE_CONFIG.Other.badgeClasses
    expect(unknownClasses).toBe(otherClasses)
  })
})

describe("LANGUAGE_CONFIG", () => {
  it("has all required properties for each language", () => {
    for (const [name, config] of Object.entries(LANGUAGE_CONFIG)) {
      expect(config).toHaveProperty("name")
      expect(config).toHaveProperty("codemirror")
      expect(config).toHaveProperty("shiki")
      expect(config).toHaveProperty("badgeClasses")
      expect(config.name).toBe(name)
    }
  })

  it("has valid badge classes format for all languages", () => {
    for (const config of Object.values(LANGUAGE_CONFIG)) {
      expect(config.badgeClasses).toMatch(/bg-\w+-\d+/)
      expect(config.badgeClasses).toMatch(/text-\w+-\d+/)
      expect(config.badgeClasses).toMatch(/border-\w+-\d+/)
    }
  })
})

describe("LANGUAGES", () => {
  it("is an array of all language names", () => {
    expect(Array.isArray(LANGUAGES)).toBe(true)
    expect(LANGUAGES.length).toBeGreaterThan(0)
  })

  it("contains common programming languages", () => {
    expect(LANGUAGES).toContain("JavaScript")
    expect(LANGUAGES).toContain("TypeScript")
    expect(LANGUAGES).toContain("Python")
    expect(LANGUAGES).toContain("Java")
    expect(LANGUAGES).toContain("Go")
    expect(LANGUAGES).toContain("Rust")
  })

  it("matches the keys of LANGUAGE_CONFIG", () => {
    const configKeys = Object.keys(LANGUAGE_CONFIG)
    expect([...LANGUAGES].sort()).toEqual(configKeys.sort())
  })
})
