import { getLanguageBadgeClasses } from "@/lib/constants/languages"

/**
 * Returns Tailwind CSS classes for language badges based on the programming language
 * @deprecated Use getLanguageBadgeClasses from @/lib/constants/languages instead
 */
export function getLanguageColor(language: string): string {
  return getLanguageBadgeClasses(language)
}

