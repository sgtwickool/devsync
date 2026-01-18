import { codeToHtml } from "shiki"
import { cn } from "@/lib/utils"

/**
 * Maps display language names to Shiki language identifiers
 * Shiki supports 150+ languages - this maps our UI names to Shiki's IDs
 */
const SHIKI_LANGUAGE_MAP: Record<string, string> = {
  // Popular languages
  JavaScript: "javascript",
  TypeScript: "typescript",
  React: "tsx",
  Python: "python",
  Java: "java",
  "C++": "cpp",
  "C#": "csharp",
  C: "c",
  Go: "go",
  Rust: "rust",
  PHP: "php",
  Ruby: "ruby",
  Swift: "swift",
  Kotlin: "kotlin",
  Scala: "scala",
  
  // Web
  HTML: "html",
  CSS: "css",
  SCSS: "scss",
  SASS: "sass",
  Less: "less",
  Vue: "vue",
  Svelte: "svelte",
  
  // Data & Config
  JSON: "json",
  YAML: "yaml",
  TOML: "toml",
  XML: "xml",
  GraphQL: "graphql",
  
  // Shell & Scripts
  Bash: "bash",
  Shell: "shellscript",
  PowerShell: "powershell",
  Fish: "fish",
  Zsh: "zsh",
  
  // Systems
  Zig: "zig",
  Nim: "nim",
  Haskell: "haskell",
  Elixir: "elixir",
  Erlang: "erlang",
  Clojure: "clojure",
  "F#": "fsharp",
  OCaml: "ocaml",
  Lua: "lua",
  Perl: "perl",
  R: "r",
  Julia: "julia",
  Dart: "dart",
  
  // Databases
  SQL: "sql",
  PostgreSQL: "sql",
  MySQL: "sql",
  
  // DevOps & Infrastructure
  Dockerfile: "dockerfile",
  Terraform: "hcl",
  HCL: "hcl",
  Nginx: "nginx",
  
  // Documentation
  Markdown: "markdown",
  LaTeX: "latex",
  
  // Mobile
  "Objective-C": "objective-c",
  
  // Assembly & Low-level
  Assembly: "asm",
  WebAssembly: "wasm",
  
  // Other
  Diff: "diff",
  Regex: "regex",
  Other: "text",
}

interface CodeViewerProps {
  code: string
  language: string
}

export async function CodeViewer({ code, language }: CodeViewerProps) {
  // Map the display language to Shiki's language ID
  const shikiLang = SHIKI_LANGUAGE_MAP[language] || language.toLowerCase() || "text"
  
  let html: string
  
  try {
    html = await codeToHtml(code, {
      lang: shikiLang,
      theme: "one-dark-pro",
    })
  } catch {
    // Fallback to plain text if language not supported
    html = await codeToHtml(code, {
      lang: "text",
      theme: "one-dark-pro",
    })
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-[#282c34] border-b border-border/50">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {language}
        </span>
      </div>
      <div
        className={cn(
          "overflow-x-auto",
          "[&_pre]:!bg-[#282c34]",
          "[&_pre]:!m-0",
          "[&_pre]:p-4",
          "[&_pre]:font-mono",
          "[&_pre]:text-sm",
          "[&_pre]:leading-relaxed",
          "[&_code]:!bg-transparent",
          // Line numbers styling (Shiki adds these with certain options)
          "[&_.line]:min-h-[1.5rem]",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
