import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export utilities for convenience
export { formatRelativeDate, formatFullDate } from "./utils/date"
export { getLanguageColor } from "./utils/language"
