/**
 * Returns Tailwind CSS classes for language badges based on the programming language
 */
export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: "bg-yellow-100 text-yellow-800 border-yellow-200",
    TypeScript: "bg-blue-100 text-blue-800 border-blue-200",
    Python: "bg-green-100 text-green-800 border-green-200",
    Java: "bg-orange-100 text-orange-800 border-orange-200",
    "C++": "bg-purple-100 text-purple-800 border-purple-200",
    "C#": "bg-indigo-100 text-indigo-800 border-indigo-200",
    Go: "bg-cyan-100 text-cyan-800 border-cyan-200",
    Rust: "bg-red-100 text-red-800 border-red-200",
    PHP: "bg-pink-100 text-pink-800 border-pink-200",
    Ruby: "bg-rose-100 text-rose-800 border-rose-200",
    Swift: "bg-amber-100 text-amber-800 border-amber-200",
    Kotlin: "bg-violet-100 text-violet-800 border-violet-200",
    HTML: "bg-orange-100 text-orange-800 border-orange-200",
    CSS: "bg-blue-100 text-blue-800 border-blue-200",
    SQL: "bg-sky-100 text-sky-800 border-sky-200",
    Bash: "bg-gray-100 text-gray-800 border-gray-200",
    Shell: "bg-gray-100 text-gray-800 border-gray-200",
    JSON: "bg-emerald-100 text-emerald-800 border-emerald-200",
    YAML: "bg-teal-100 text-teal-800 border-teal-200",
    Markdown: "bg-slate-100 text-slate-800 border-slate-200",
    Other: "bg-gray-100 text-gray-800 border-gray-200",
  }
  return colors[language] || colors.Other
}

