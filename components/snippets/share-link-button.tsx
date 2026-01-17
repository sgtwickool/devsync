"use client"

import { useState } from "react"
import { Link2, Check, Globe } from "lucide-react"

interface ShareLinkButtonProps {
  snippetId: string
  isPublic: boolean
}

export function ShareLinkButton({ snippetId, isPublic }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  if (!isPublic) {
    return null
  }

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/s/${snippetId}`
    : `/s/${snippetId}`

  async function handleCopy() {
    try {
      const url = `${window.location.origin}/s/${snippetId}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950 rounded-md">
        <Globe className="w-3 h-3" />
        Public
      </span>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Copy share link"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>Link Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" aria-hidden="true" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  )
}
