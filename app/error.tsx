"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { LoadingButton } from "@/components/ui/loading-button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/3 px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-lg p-8 text-center space-y-6">
        <div className="inline-flex p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="w-12 h-12 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <LoadingButton onClick={reset} variant="primary">
            Try again
          </LoadingButton>
          <LoadingButton
            onClick={() => (window.location.href = "/dashboard")}
            variant="outline"
          >
            Go to dashboard
          </LoadingButton>
        </div>
      </div>
    </div>
  )
}
