"use client"

import { AlertCircle } from "lucide-react"

interface ErrorAlertProps {
  error: string
  className?: string
}

export function ErrorAlert({ error, className = "" }: ErrorAlertProps) {
  if (!error) return null

  return (
    <div
      className={`bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3 ${className}`}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm font-medium">{error}</p>
    </div>
  )
}

