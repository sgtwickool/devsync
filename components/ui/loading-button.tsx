"use client"

import { Loader2 } from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  children: ReactNode
  variant?: "primary" | "secondary" | "destructive" | "outline"
}

const variantClasses = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-card border border-border hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
} as const satisfies Record<NonNullable<LoadingButtonProps["variant"]>, string>

export function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  variant = "primary",
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 transition-all",
        variantClasses[variant ?? "primary"],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {isLoading && loadingText ? loadingText : children}
    </button>
  )
}

