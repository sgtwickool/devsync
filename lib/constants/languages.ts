/**
 * Centralized language configuration for the application
 * This is the single source of truth for all language-related mappings
 */

/**
 * Language configuration type
 */
interface LanguageConfig {
  /** Display name shown in UI */
  name: string
  /** CodeMirror language identifier (null = falls back to JavaScript) */
  codemirror: string | null
  /** Shiki language identifier */
  shiki: string
  /** Tailwind classes for badge styling */
  badgeClasses: string
}

/**
 * Complete language configuration
 * All language-related data in one place
 */
export const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
  // Popular / General Purpose
  JavaScript: {
    name: "JavaScript",
    codemirror: "javascript",
    shiki: "javascript",
    badgeClasses: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  TypeScript: {
    name: "TypeScript",
    codemirror: "typescript",
    shiki: "typescript",
    badgeClasses: "bg-blue-100 text-blue-800 border-blue-200",
  },
  Python: {
    name: "Python",
    codemirror: "python",
    shiki: "python",
    badgeClasses: "bg-green-100 text-green-800 border-green-200",
  },
  Java: {
    name: "Java",
    codemirror: "java",
    shiki: "java",
    badgeClasses: "bg-orange-100 text-orange-800 border-orange-200",
  },
  "C++": {
    name: "C++",
    codemirror: "cpp",
    shiki: "cpp",
    badgeClasses: "bg-purple-100 text-purple-800 border-purple-200",
  },
  "C#": {
    name: "C#",
    codemirror: "csharp",
    shiki: "csharp",
    badgeClasses: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  C: {
    name: "C",
    codemirror: "cpp", // CodeMirror cpp works for C
    shiki: "c",
    badgeClasses: "bg-slate-100 text-slate-800 border-slate-200",
  },
  Go: {
    name: "Go",
    codemirror: null, // Falls back to JS
    shiki: "go",
    badgeClasses: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  Rust: {
    name: "Rust",
    codemirror: "rust",
    shiki: "rust",
    badgeClasses: "bg-red-100 text-red-800 border-red-200",
  },
  PHP: {
    name: "PHP",
    codemirror: "php",
    shiki: "php",
    badgeClasses: "bg-pink-100 text-pink-800 border-pink-200",
  },
  Ruby: {
    name: "Ruby",
    codemirror: null,
    shiki: "ruby",
    badgeClasses: "bg-rose-100 text-rose-800 border-rose-200",
  },
  Swift: {
    name: "Swift",
    codemirror: null,
    shiki: "swift",
    badgeClasses: "bg-amber-100 text-amber-800 border-amber-200",
  },
  Kotlin: {
    name: "Kotlin",
    codemirror: null,
    shiki: "kotlin",
    badgeClasses: "bg-violet-100 text-violet-800 border-violet-200",
  },
  Scala: {
    name: "Scala",
    codemirror: null,
    shiki: "scala",
    badgeClasses: "bg-red-100 text-red-800 border-red-200",
  },
  Dart: {
    name: "Dart",
    codemirror: null,
    shiki: "dart",
    badgeClasses: "bg-sky-100 text-sky-800 border-sky-200",
  },

  // Web Frontend
  React: {
    name: "React",
    codemirror: "react",
    shiki: "tsx",
    badgeClasses: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  Vue: {
    name: "Vue",
    codemirror: null,
    shiki: "vue",
    badgeClasses: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  Svelte: {
    name: "Svelte",
    codemirror: null,
    shiki: "svelte",
    badgeClasses: "bg-orange-100 text-orange-800 border-orange-200",
  },
  HTML: {
    name: "HTML",
    codemirror: "markup",
    shiki: "html",
    badgeClasses: "bg-orange-100 text-orange-800 border-orange-200",
  },
  CSS: {
    name: "CSS",
    codemirror: "css",
    shiki: "css",
    badgeClasses: "bg-blue-100 text-blue-800 border-blue-200",
  },
  SCSS: {
    name: "SCSS",
    codemirror: null,
    shiki: "scss",
    badgeClasses: "bg-pink-100 text-pink-800 border-pink-200",
  },
  SASS: {
    name: "SASS",
    codemirror: null,
    shiki: "sass",
    badgeClasses: "bg-pink-100 text-pink-800 border-pink-200",
  },
  Less: {
    name: "Less",
    codemirror: null,
    shiki: "less",
    badgeClasses: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },

  // Data & Config
  JSON: {
    name: "JSON",
    codemirror: "json",
    shiki: "json",
    badgeClasses: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  YAML: {
    name: "YAML",
    codemirror: "yaml",
    shiki: "yaml",
    badgeClasses: "bg-teal-100 text-teal-800 border-teal-200",
  },
  TOML: {
    name: "TOML",
    codemirror: null,
    shiki: "toml",
    badgeClasses: "bg-orange-100 text-orange-800 border-orange-200",
  },
  XML: {
    name: "XML",
    codemirror: null,
    shiki: "xml",
    badgeClasses: "bg-amber-100 text-amber-800 border-amber-200",
  },
  GraphQL: {
    name: "GraphQL",
    codemirror: null,
    shiki: "graphql",
    badgeClasses: "bg-pink-100 text-pink-800 border-pink-200",
  },

  // Shell & Scripting
  Bash: {
    name: "Bash",
    codemirror: null,
    shiki: "bash",
    badgeClasses: "bg-gray-100 text-gray-800 border-gray-200",
  },
  Shell: {
    name: "Shell",
    codemirror: null,
    shiki: "shellscript",
    badgeClasses: "bg-gray-100 text-gray-800 border-gray-200",
  },
  PowerShell: {
    name: "PowerShell",
    codemirror: null,
    shiki: "powershell",
    badgeClasses: "bg-blue-100 text-blue-800 border-blue-200",
  },
  Fish: {
    name: "Fish",
    codemirror: null,
    shiki: "fish",
    badgeClasses: "bg-teal-100 text-teal-800 border-teal-200",
  },
  Zsh: {
    name: "Zsh",
    codemirror: null,
    shiki: "zsh",
    badgeClasses: "bg-gray-100 text-gray-800 border-gray-200",
  },

  // Functional
  Haskell: {
    name: "Haskell",
    codemirror: null,
    shiki: "haskell",
    badgeClasses: "bg-purple-100 text-purple-800 border-purple-200",
  },
  Elixir: {
    name: "Elixir",
    codemirror: null,
    shiki: "elixir",
    badgeClasses: "bg-violet-100 text-violet-800 border-violet-200",
  },
  Erlang: {
    name: "Erlang",
    codemirror: null,
    shiki: "erlang",
    badgeClasses: "bg-red-100 text-red-800 border-red-200",
  },
  Clojure: {
    name: "Clojure",
    codemirror: null,
    shiki: "clojure",
    badgeClasses: "bg-green-100 text-green-800 border-green-200",
  },
  "F#": {
    name: "F#",
    codemirror: null,
    shiki: "fsharp",
    badgeClasses: "bg-blue-100 text-blue-800 border-blue-200",
  },
  OCaml: {
    name: "OCaml",
    codemirror: null,
    shiki: "ocaml",
    badgeClasses: "bg-orange-100 text-orange-800 border-orange-200",
  },

  // Scientific & Data
  R: {
    name: "R",
    codemirror: null,
    shiki: "r",
    badgeClasses: "bg-blue-100 text-blue-800 border-blue-200",
  },
  Julia: {
    name: "Julia",
    codemirror: null,
    shiki: "julia",
    badgeClasses: "bg-purple-100 text-purple-800 border-purple-200",
  },
  MATLAB: {
    name: "MATLAB",
    codemirror: null,
    shiki: "matlab",
    badgeClasses: "bg-orange-100 text-orange-800 border-orange-200",
  },

  // Systems & Low-level
  Zig: {
    name: "Zig",
    codemirror: null,
    shiki: "zig",
    badgeClasses: "bg-amber-100 text-amber-800 border-amber-200",
  },
  Nim: {
    name: "Nim",
    codemirror: null,
    shiki: "nim",
    badgeClasses: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  Lua: {
    name: "Lua",
    codemirror: null,
    shiki: "lua",
    badgeClasses: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  Perl: {
    name: "Perl",
    codemirror: null,
    shiki: "perl",
    badgeClasses: "bg-blue-100 text-blue-800 border-blue-200",
  },
  Assembly: {
    name: "Assembly",
    codemirror: null,
    shiki: "asm",
    badgeClasses: "bg-gray-100 text-gray-800 border-gray-200",
  },
  WebAssembly: {
    name: "WebAssembly",
    codemirror: null,
    shiki: "wasm",
    badgeClasses: "bg-purple-100 text-purple-800 border-purple-200",
  },

  // Database
  SQL: {
    name: "SQL",
    codemirror: "sql",
    shiki: "sql",
    badgeClasses: "bg-sky-100 text-sky-800 border-sky-200",
  },
  PostgreSQL: {
    name: "PostgreSQL",
    codemirror: "sql",
    shiki: "sql",
    badgeClasses: "bg-blue-100 text-blue-800 border-blue-200",
  },
  MySQL: {
    name: "MySQL",
    codemirror: "sql",
    shiki: "sql",
    badgeClasses: "bg-orange-100 text-orange-800 border-orange-200",
  },

  // DevOps & Infrastructure
  Dockerfile: {
    name: "Dockerfile",
    codemirror: null,
    shiki: "dockerfile",
    badgeClasses: "bg-blue-100 text-blue-800 border-blue-200",
  },
  Terraform: {
    name: "Terraform",
    codemirror: null,
    shiki: "hcl",
    badgeClasses: "bg-purple-100 text-purple-800 border-purple-200",
  },
  HCL: {
    name: "HCL",
    codemirror: null,
    shiki: "hcl",
    badgeClasses: "bg-purple-100 text-purple-800 border-purple-200",
  },
  Nginx: {
    name: "Nginx",
    codemirror: null,
    shiki: "nginx",
    badgeClasses: "bg-green-100 text-green-800 border-green-200",
  },

  // Mobile
  "Objective-C": {
    name: "Objective-C",
    codemirror: null,
    shiki: "objective-c",
    badgeClasses: "bg-blue-100 text-blue-800 border-blue-200",
  },

  // Documentation
  Markdown: {
    name: "Markdown",
    codemirror: "markdown",
    shiki: "markdown",
    badgeClasses: "bg-slate-100 text-slate-800 border-slate-200",
  },
  LaTeX: {
    name: "LaTeX",
    codemirror: null,
    shiki: "latex",
    badgeClasses: "bg-teal-100 text-teal-800 border-teal-200",
  },

  // Other
  Diff: {
    name: "Diff",
    codemirror: null,
    shiki: "diff",
    badgeClasses: "bg-green-100 text-green-800 border-green-200",
  },
  Regex: {
    name: "Regex",
    codemirror: null,
    shiki: "regex",
    badgeClasses: "bg-amber-100 text-amber-800 border-amber-200",
  },
  Other: {
    name: "Other",
    codemirror: null,
    shiki: "text",
    badgeClasses: "bg-gray-100 text-gray-800 border-gray-200",
  },
}

/**
 * List of all supported language names for dropdowns
 */
export const LANGUAGES = Object.keys(LANGUAGE_CONFIG) as readonly string[]

export type Language = keyof typeof LANGUAGE_CONFIG

/**
 * Get CodeMirror language identifier for a language
 * Returns "javascript" as fallback if not supported
 */
export function getCodeMirrorLanguage(language: string): string {
  return LANGUAGE_CONFIG[language]?.codemirror || "javascript"
}

/**
 * Get Shiki language identifier for a language
 * Returns "text" as fallback if not found
 */
export function getShikiLanguage(language: string): string {
  return LANGUAGE_CONFIG[language]?.shiki || language.toLowerCase() || "text"
}

/**
 * Get badge classes for a language
 */
export function getLanguageBadgeClasses(language: string): string {
  return LANGUAGE_CONFIG[language]?.badgeClasses || LANGUAGE_CONFIG.Other.badgeClasses
}

/**
 * Legacy export for backwards compatibility
 * @deprecated Use getCodeMirrorLanguage() instead
 */
export const LANGUAGE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(LANGUAGE_CONFIG)
    .filter(([, config]) => config.codemirror !== null)
    .map(([name, config]) => [name, config.codemirror as string])
)
