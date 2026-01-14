"use client"

import { registerUser } from "@/lib/actions/auth"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Github } from "lucide-react"

export function RegisterForm() {
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
    
    startTransition(async () => {
    const result = await registerUser(formData)

      if ("error" in result) {
      setError(result.error)
      return
    }

    // Auto-login after registration
    try {
      const email = formData.get("email")
      const password = formData.get("password")
      
      if (email && password) {
        const signInResult = await signIn("credentials", {
          email: String(email),
          password: String(password),
          redirect: false,
        })

        if (signInResult?.error) {
          // Registration succeeded but auto-login failed, redirect to login
          router.push(`/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`)
          return
        }

        // Successfully registered and logged in, redirect to callback URL
        router.push(callbackUrl)
        router.refresh()
      } else {
        // Fallback to login page if email/password not available
        router.push(`/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`)
      }
    } catch {
      // If auto-login fails, redirect to login page
      router.push(`/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`)
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
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* GitHub OAuth Button */}
      <button
        type="button"
        onClick={handleGitHubSignIn}
        disabled={isOAuthPending || isPending}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Github className="w-5 h-5" />
        {isOAuthPending ? "Connecting..." : "Continue with GitHub"}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Or create account with email</span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="mt-1 block w-full px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="mt-1 block w-full px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || isOAuthPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  )
}
