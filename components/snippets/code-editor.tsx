"use client"

import { useMemo } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { oneDark } from "@codemirror/theme-one-dark"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { sql } from "@codemirror/lang-sql"
import { json } from "@codemirror/lang-json"
import { yaml } from "@codemirror/lang-yaml"
import { markdown } from "@codemirror/lang-markdown"
import { rust } from "@codemirror/lang-rust"
import { php } from "@codemirror/lang-php"
import { csharp } from "@replit/codemirror-lang-csharp"
import { getCodeMirrorLanguage } from "@/lib/constants/languages"
import { cn } from "@/lib/utils"

const jsLang = () => javascript({ jsx: false })

const languageLoaders: Record<string, () => any> = {
  javascript: jsLang,
  typescript: () => javascript({ jsx: false, typescript: true }),
  react: () => javascript({ jsx: true }),
  python: () => python(),
  java: () => java(),
  cpp: () => cpp(),
  csharp: () => csharp(),
  rust: () => rust(),
  php: () => php(),
  markup: () => html(),
  css: () => css(),
  sql: () => sql(),
  json: () => json(),
  yaml: () => yaml(),
  markdown: () => markdown(),
}

interface CodeEditorProps {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  language: string
  placeholder?: string
  required?: boolean
  rows?: number
  className?: string
  "aria-describedby"?: string
}

export function CodeEditor({
  id,
  name,
  value,
  onChange,
  language,
  placeholder,
  required,
  rows = 15,
  className,
  "aria-describedby": ariaDescribedBy,
}: CodeEditorProps) {
  const codeMirrorLanguage = getCodeMirrorLanguage(language)

  const languageExtension = useMemo(
    () => (languageLoaders[codeMirrorLanguage] || jsLang)(),
    [codeMirrorLanguage]
  )

  return (
    <div className="relative">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={oneDark}
        extensions={[languageExtension]}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          bracketMatching: true,
          closeBrackets: true,
        }}
        minHeight={`${rows * 1.6 * 16}px`}
        maxHeight="600px"
        className={cn(
          "rounded-lg border border-input overflow-hidden",
          "[&_.cm-editor]:outline-none",
          "[&_.cm-scroller]:font-mono",
          "[&_.cm-scroller]:text-sm",
          "[&_.cm-content]:px-4",
          "[&_.cm-content]:py-4",
          "[&_.cm-gutters]:bg-[#252526]",
          "[&_.cm-gutters]:border-r",
          "[&_.cm-gutters]:border-[#3e3e42]",
          "[&_.cm-lineNumbers]:text-[#858585]",
          className
        )}
      />
      {/* Hidden textarea for form submission */}
      {name && (
        <textarea
          id={id}
          name={name}
          value={value}
          readOnly
          required={required}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          aria-describedby={ariaDescribedBy}
        />
      )}
    </div>
  )
}
