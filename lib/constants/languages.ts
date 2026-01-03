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

