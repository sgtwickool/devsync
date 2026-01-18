/**
 * Supported programming languages for snippets
 * The viewer (Shiki) supports all of these with proper syntax highlighting
 * The editor (CodeMirror) supports a subset - others fall back to JavaScript
 */
export const LANGUAGES = [
  // Popular / General Purpose
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "C",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Scala",
  "Dart",
  
  // Web Frontend
  "React",
  "Vue",
  "Svelte",
  "HTML",
  "CSS",
  "SCSS",
  "SASS",
  "Less",
  
  // Data & Config
  "JSON",
  "YAML",
  "TOML",
  "XML",
  "GraphQL",
  
  // Shell & Scripting
  "Bash",
  "Shell",
  "PowerShell",
  "Fish",
  "Zsh",
  
  // Functional
  "Haskell",
  "Elixir",
  "Erlang",
  "Clojure",
  "F#",
  "OCaml",
  
  // Scientific & Data
  "R",
  "Julia",
  "MATLAB",
  
  // Systems & Low-level
  "Zig",
  "Nim",
  "Lua",
  "Perl",
  "Assembly",
  
  // Database
  "SQL",
  "PostgreSQL",
  "MySQL",
  
  // DevOps & Infrastructure
  "Dockerfile",
  "Terraform",
  "HCL",
  "Nginx",
  
  // Mobile
  "Objective-C",
  
  // Documentation
  "Markdown",
  "LaTeX",
  
  // Other
  "Diff",
  "Regex",
  "Other",
] as const

export type Language = (typeof LANGUAGES)[number]

/**
 * Maps display language names to CodeMirror language identifiers
 * Used by the code editor component
 * Languages not in this map fall back to JavaScript
 */
export const LANGUAGE_MAP: Record<string, string> = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  React: "react",
  Python: "python",
  Java: "java",
  "C++": "cpp",
  "C#": "csharp",
  C: "cpp", // CodeMirror cpp works for C
  Go: "go",
  Rust: "rust",
  PHP: "php",
  Ruby: "ruby",
  Swift: "swift",
  Kotlin: "kotlin",
  HTML: "markup",
  CSS: "css",
  SQL: "sql",
  PostgreSQL: "sql",
  MySQL: "sql",
  Bash: "bash",
  Shell: "bash",
  JSON: "json",
  YAML: "yaml",
  Markdown: "markdown",
  // All other languages fall back to JavaScript in the editor
  // but will be properly highlighted in the viewer via Shiki
}
