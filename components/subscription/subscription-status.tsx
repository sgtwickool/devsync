"use client"

import { Crown, CheckCircle2 } from "lucide-react"
import type { SubscriptionTier } from "@prisma/client"

interface SubscriptionStatusProps {
  tier: SubscriptionTier
  className?: string
}

export function SubscriptionStatus({ tier, className }: SubscriptionStatusProps) {
  if (tier === "PRO") {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 ${className || ""}`}>
        <Crown className="w-4 h-4" />
        <span className="text-sm font-semibold">PRO</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 bg-accent text-accent-foreground rounded-lg ${className || ""}`}>
      <CheckCircle2 className="w-4 h-4" />
      <span className="text-sm font-semibold">FREE</span>
    </div>
  )
}
