"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Github } from "lucide-react"
import { ErrorAlert } from "@/components/ui/error-alert"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isOAuthPending, setIsOAuthPending] = useState(false)
  
  // Get callback URL from search params, default to dashboard
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    startTransition(async () => {
    try {
      const result = await signIn("credentials", {
          email: String(email),
          password: String(password),
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      router.push(callbackUrl)
      router.refresh()
      } catch {
      setError("Something went wrong. Please try again.")
    }
    })
  }

  async function handleGitHubSignIn() {
    setIsOAuthPending(true)
    setError(null)
    try {
      await signIn("github", { callbackUrl })
    } catch {
      setError("Failed to sign in with GitHub. Please try again.")
      setIsOAuthPending(false)
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <ErrorAlert error={error ?? undefined} />

      {/* GitHub OAuth Button */}
      <button
        type="button"
        onClick={handleGitHubSignIn}
        disabled={isOAuthPending || isPending}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Github className="w-5 h-5" />
        {isOAuthPending ? "Connecting..." : "Continue with GitHub"}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      {/* Credentials Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || isOAuthPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  )
}
