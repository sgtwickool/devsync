/**
 * Supported programming languages for snippets
 */
export const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "React",
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

export type Language = (typeof LANGUAGES)[number]

/**
 * Maps display language names to CodeMirror language identifiers
 */
export const LANGUAGE_MAP = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  React: "react",
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
  Other: "javascript",
} as const satisfies Record<Language, string>

