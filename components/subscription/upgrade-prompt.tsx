"use client"

import { Crown, Sparkles } from "lucide-react"
import Link from "next/link"

interface UpgradePromptProps {
  title: string
  description: string
  feature?: string
  className?: string
}

export function UpgradePrompt({
  title,
  description,
  feature,
  className,
}: UpgradePromptProps) {
  return (
    <div
      className={`bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 ${className || ""}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/20 rounded-lg flex-shrink-0">
          <Crown className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
            {title}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary rounded-md text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              PRO
            </span>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <Link
            href="/dashboard/settings?tab=billing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
          >
            <Crown className="w-4 h-4" />
            Upgrade to PRO
          </Link>
        </div>
      </div>
    </div>
  )
}
