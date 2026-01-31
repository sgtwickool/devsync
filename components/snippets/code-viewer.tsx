"use client"

import { useEffect, useState } from "react"
import { codeToHtml } from "shiki"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { getShikiLanguage } from "@/lib/constants/languages"

interface CodeViewerProps {
  code: string
  language: string
  theme?: "light" | "dark"
}

export function CodeViewer({ code, language, theme: themeProp }: CodeViewerProps) {
  const { resolvedTheme } = useTheme()
  const [html, setHtml] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  // Determine theme: prop override > resolved theme > dark fallback
  const theme = themeProp ?? (mounted && resolvedTheme === "light" ? "light" : "dark")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const highlight = async () => {
      const shikiLang = getShikiLanguage(language)
      const shikiTheme = theme === "light" ? "github-light" : "one-dark-pro"

      try {
        const result = await codeToHtml(code, {
          lang: shikiLang,
          theme: shikiTheme,
        })
        setHtml(result)
      } catch {
        // Fallback to plain text if language not supported
        const result = await codeToHtml(code, {
          lang: "text",
          theme: shikiTheme,
        })
        setHtml(result)
      }
    }

    highlight()
  }, [code, language, theme])

  const isDark = theme === "dark"
  const headerBg = isDark ? "bg-[#282c34]" : "bg-[#f6f8fa]"
  const codeBg = isDark ? "[&_pre]:!bg-[#282c34]" : "[&_pre]:!bg-[#f6f8fa]"

  return (
    <div className="relative rounded-lg overflow-hidden border border-border">
      <div className={cn("flex items-center justify-between px-4 py-2 border-b border-border/50", headerBg)}>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {language}
        </span>
      </div>
      <div
        className={cn(
          "overflow-x-auto min-h-[100px]",
          codeBg,
          "[&_pre]:!m-0",
          "[&_pre]:p-4",
          "[&_pre]:font-mono",
          "[&_pre]:text-sm",
          "[&_pre]:leading-relaxed",
          "[&_code]:!bg-transparent",
          "[&_.line]:min-h-[1.5rem]",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
