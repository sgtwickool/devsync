/**
 * Supported programming languages for snippets
 */
export const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "HTML",
  "CSS",
  "SQL",
  "Bash",
  "Shell",
  "JSON",
  "YAML",
  "Markdown",
  "Other",
] as const

export type Language = typeof LANGUAGES[number]

/**
 * Maps display language names to Prism.js language identifiers
 */
export const PRISM_LANGUAGE_MAP: Record<string, string> = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  Python: "python",
  Java: "java",
  "C++": "cpp",
  "C#": "csharp",
  Go: "go",
  Rust: "rust",
  PHP: "php",
  Ruby: "ruby",
  Swift: "swift",
  Kotlin: "kotlin",
  HTML: "markup",
  CSS: "css",
  SQL: "sql",
  Bash: "bash",
  Shell: "bash",
  JSON: "json",
  YAML: "yaml",
  Markdown: "markdown",
  Other: "javascript", // Default to JavaScript for "Other"
}

