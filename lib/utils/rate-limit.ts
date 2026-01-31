const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

/**
 * Simple in-memory rate limiter
 * @param key - Unique identifier for the rate limit (e.g., "tags:userId")
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with success status and remaining requests
 */
export function rateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60000
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now - record.lastReset > windowMs) {
    rateLimitMap.set(key, { count: 1, lastReset: now })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: limit - record.count }
}
