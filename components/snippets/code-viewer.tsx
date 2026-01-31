import { codeToHtml } from "shiki"
import { cn } from "@/lib/utils"
import { getShikiLanguage } from "@/lib/constants/languages"

interface CodeViewerProps {
  code: string
  language: string
  theme?: "light" | "dark"
}

export async function CodeViewer({ code, language, theme = "dark" }: CodeViewerProps) {
  // Map the display language to Shiki's language ID
  const shikiLang = getShikiLanguage(language)
  const shikiTheme = theme === "light" ? "github-light" : "one-dark-pro"

  let html: string

  try {
    html = await codeToHtml(code, {
      lang: shikiLang,
      theme: shikiTheme,
    })
  } catch {
    // Fallback to plain text if language not supported
    html = await codeToHtml(code, {
      lang: "text",
      theme: shikiTheme,
    })
  }

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
          "overflow-x-auto",
          codeBg,
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
