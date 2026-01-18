/**
 * Returns Tailwind CSS classes for language badges based on the programming language
 */
export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    // Popular / General Purpose
    JavaScript: "bg-yellow-100 text-yellow-800 border-yellow-200",
    TypeScript: "bg-blue-100 text-blue-800 border-blue-200",
    Python: "bg-green-100 text-green-800 border-green-200",
    Java: "bg-orange-100 text-orange-800 border-orange-200",
    "C++": "bg-purple-100 text-purple-800 border-purple-200",
    "C#": "bg-indigo-100 text-indigo-800 border-indigo-200",
    C: "bg-slate-100 text-slate-800 border-slate-200",
    Go: "bg-cyan-100 text-cyan-800 border-cyan-200",
    Rust: "bg-red-100 text-red-800 border-red-200",
    PHP: "bg-pink-100 text-pink-800 border-pink-200",
    Ruby: "bg-rose-100 text-rose-800 border-rose-200",
    Swift: "bg-amber-100 text-amber-800 border-amber-200",
    Kotlin: "bg-violet-100 text-violet-800 border-violet-200",
    Scala: "bg-red-100 text-red-800 border-red-200",
    Dart: "bg-sky-100 text-sky-800 border-sky-200",
    
    // Web Frontend
    React: "bg-cyan-100 text-cyan-800 border-cyan-200",
    Vue: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Svelte: "bg-orange-100 text-orange-800 border-orange-200",
    HTML: "bg-orange-100 text-orange-800 border-orange-200",
    CSS: "bg-blue-100 text-blue-800 border-blue-200",
    SCSS: "bg-pink-100 text-pink-800 border-pink-200",
    SASS: "bg-pink-100 text-pink-800 border-pink-200",
    Less: "bg-indigo-100 text-indigo-800 border-indigo-200",
    
    // Data & Config
    JSON: "bg-emerald-100 text-emerald-800 border-emerald-200",
    YAML: "bg-teal-100 text-teal-800 border-teal-200",
    TOML: "bg-orange-100 text-orange-800 border-orange-200",
    XML: "bg-amber-100 text-amber-800 border-amber-200",
    GraphQL: "bg-pink-100 text-pink-800 border-pink-200",
    
    // Shell & Scripting
    Bash: "bg-gray-100 text-gray-800 border-gray-200",
    Shell: "bg-gray-100 text-gray-800 border-gray-200",
    PowerShell: "bg-blue-100 text-blue-800 border-blue-200",
    Fish: "bg-teal-100 text-teal-800 border-teal-200",
    Zsh: "bg-gray-100 text-gray-800 border-gray-200",
    
    // Functional
    Haskell: "bg-purple-100 text-purple-800 border-purple-200",
    Elixir: "bg-violet-100 text-violet-800 border-violet-200",
    Erlang: "bg-red-100 text-red-800 border-red-200",
    Clojure: "bg-green-100 text-green-800 border-green-200",
    "F#": "bg-blue-100 text-blue-800 border-blue-200",
    OCaml: "bg-orange-100 text-orange-800 border-orange-200",
    
    // Scientific & Data
    R: "bg-blue-100 text-blue-800 border-blue-200",
    Julia: "bg-purple-100 text-purple-800 border-purple-200",
    MATLAB: "bg-orange-100 text-orange-800 border-orange-200",
    
    // Systems & Low-level
    Zig: "bg-amber-100 text-amber-800 border-amber-200",
    Nim: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Lua: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Perl: "bg-blue-100 text-blue-800 border-blue-200",
    Assembly: "bg-gray-100 text-gray-800 border-gray-200",
    
    // Database
    SQL: "bg-sky-100 text-sky-800 border-sky-200",
    PostgreSQL: "bg-blue-100 text-blue-800 border-blue-200",
    MySQL: "bg-orange-100 text-orange-800 border-orange-200",
    
    // DevOps & Infrastructure
    Dockerfile: "bg-blue-100 text-blue-800 border-blue-200",
    Terraform: "bg-purple-100 text-purple-800 border-purple-200",
    HCL: "bg-purple-100 text-purple-800 border-purple-200",
    Nginx: "bg-green-100 text-green-800 border-green-200",
    
    // Mobile
    "Objective-C": "bg-blue-100 text-blue-800 border-blue-200",
    
    // Documentation
    Markdown: "bg-slate-100 text-slate-800 border-slate-200",
    LaTeX: "bg-teal-100 text-teal-800 border-teal-200",
    
    // Other
    Diff: "bg-green-100 text-green-800 border-green-200",
    Regex: "bg-amber-100 text-amber-800 border-amber-200",
    Other: "bg-gray-100 text-gray-800 border-gray-200",
  }
  
  return colors[language] ?? colors.Other
}

