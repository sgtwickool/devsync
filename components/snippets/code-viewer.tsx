"use client"

import { useEffect, useRef, useState } from "react"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"

// Language import map - load dynamically to avoid import-time errors
const languageImports: Record<string, () => Promise<void>> = {
  javascript: () => import("prismjs/components/prism-javascript").then(() => {}),
  typescript: () => import("prismjs/components/prism-typescript").then(() => {}),
  python: () => import("prismjs/components/prism-python").then(() => {}),
  java: () => import("prismjs/components/prism-java").then(() => {}),
  cpp: async () => {
    await import("prismjs/components/prism-c")
    await import("prismjs/components/prism-cpp")
  },
  csharp: () => import("prismjs/components/prism-csharp").then(() => {}),
  go: () => import("prismjs/components/prism-go").then(() => {}),
  rust: () => import("prismjs/components/prism-rust").then(() => {}),
  php: () => import("prismjs/components/prism-php").then(() => {}),
  ruby: () => import("prismjs/components/prism-ruby").then(() => {}),
  swift: () => import("prismjs/components/prism-swift").then(() => {}),
  kotlin: () => import("prismjs/components/prism-kotlin").then(() => {}),
  markup: () => import("prismjs/components/prism-markup").then(() => {}),
  css: () => import("prismjs/components/prism-css").then(() => {}),
  sql: () => import("prismjs/components/prism-sql").then(() => {}),
  bash: () => import("prismjs/components/prism-bash").then(() => {}),
  json: () => import("prismjs/components/prism-json").then(() => {}),
  yaml: () => import("prismjs/components/prism-yaml").then(() => {}),
  markdown: () => import("prismjs/components/prism-markdown").then(() => {}),
}

const languageMap: Record<string, string> = {
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
}

interface CodeViewerProps {
  code: string
  language: string
}

export function CodeViewer({ code, language }: CodeViewerProps) {
  const codeRef = useRef<HTMLElement>(null)
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const prismLanguage = languageMap[language] || "javascript"

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Load language component dynamically
    const loadLang = languageImports[prismLanguage]
    if (loadLang) {
      loadLang()
        .then(() => setIsLanguageLoaded(true))
        .catch((error) => {
          console.warn(`Failed to load ${prismLanguage} syntax highlighting:`, error)
          setIsLanguageLoaded(true) // Still try to highlight even if load fails
        })
    } else {
      setIsLanguageLoaded(true)
    }
  }, [prismLanguage])

  useEffect(() => {
    if (codeRef.current && isLanguageLoaded && isMounted) {
      // Small delay to ensure language is fully loaded
      const timer = setTimeout(() => {
        if (codeRef.current) {
          Prism.highlightElement(codeRef.current)
        }
      }, 10)
      return () => clearTimeout(timer)
    }
  }, [code, language, isLanguageLoaded, isMounted])

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-border/50">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {language}
        </span>
      </div>
      <pre className="m-0 p-4 overflow-x-auto">
        <code
          ref={codeRef}
          className={isMounted ? `language-${prismLanguage} text-sm leading-relaxed` : "text-sm leading-relaxed"}
          suppressHydrationWarning
        >
          {code}
        </code>
      </pre>
    </div>
  )
}

