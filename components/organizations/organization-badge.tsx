"use client"

import { Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrganizationBadgeProps {
  organizationName: string
  className?: string
  size?: "sm" | "md"
}

export function OrganizationBadge({
  organizationName,
  className,
  size = "md",
}: OrganizationBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary font-medium border border-primary/20",
        size === "sm" && "text-xs px-1.5 py-0.5",
        size === "md" && "text-xs",
        className
      )}
    >
      <Building2 className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      <span>{organizationName}</span>
    </span>
  )
}
