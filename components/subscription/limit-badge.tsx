"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LimitBadgeProps {
  current: number
  limit: number | null
  label: string
  className?: string
}

export function LimitBadge({ current, limit, label, className }: LimitBadgeProps) {
  if (limit === null) {
    // Unlimited (PRO tier)
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <CheckCircle2 className="w-4 h-4 text-primary" />
        <span className="text-muted-foreground">
          {label}: <span className="font-semibold text-foreground">Unlimited</span>
        </span>
      </div>
    )
  }

  const isAtLimit = current >= limit
  const percentage = Math.min((current / limit) * 100, 100)

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {isAtLimit ? (
        <XCircle className="w-4 h-4 text-destructive" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-primary" />
      )}
      <span className="text-muted-foreground">
        {label}:{" "}
        <span
          className={cn(
            "font-semibold",
            isAtLimit ? "text-destructive" : "text-foreground"
          )}
        >
          {current} / {limit}
        </span>
      </span>
      {!isAtLimit && (
        <div className="flex-1 max-w-[100px] h-1.5 bg-accent rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
