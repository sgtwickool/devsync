import { codeToHtml } from "shiki"
import { cn } from "@/lib/utils"
import { getShikiLanguage } from "@/lib/constants/languages"

interface CodeViewerProps {
  code: string
  language: string
}

export async function CodeViewer({ code, language }: CodeViewerProps) {
  // Map the display language to Shiki's language ID
  const shikiLang = getShikiLanguage(language)
  
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
