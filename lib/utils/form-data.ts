/**
 * Utility functions for working with FormData in server actions
 */

/**
 * Safely extracts a string value from FormData, returning undefined if not found or not a string
 */
export function getFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key)
  return typeof value === "string" ? value : undefined
}

/**
 * Safely extracts a required string value from FormData, throws if missing or not a string
 */
export function getRequiredFormString(formData: FormData, key: string): string {
  const value = formData.get(key)
  if (typeof value !== "string") {
    throw new Error(`${key} is required`)
  }
  return value
}

/**
 * Type-safe FormData extraction helper
 */
export function extractFormData<T extends Record<string, string | null | undefined>>(
  formData: FormData,
  keys: readonly (keyof T)[]
): Partial<T> {
  const result = {} as Partial<T>
  for (const key of keys) {
    const value = formData.get(String(key))
    result[key] = typeof value === "string" ? (value as T[keyof T]) : undefined
  }
  return result
}

