import { z } from "zod"

/**
 * Handles errors in server actions and returns a user-friendly error message
 */
export function handleServerActionError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.errors[0]?.message ?? "Validation failed"
  }
  
  if (error instanceof Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Server action error:", error)
    }
    return error.message || "Something went wrong. Please try again."
  }
  
  if (process.env.NODE_ENV === "development") {
    console.error("Server action error:", error)
  }
  
  return "Something went wrong. Please try again."
}

