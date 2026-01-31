"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="p-2 text-muted-foreground rounded-lg"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="w-5 h-5" />
      </button>
    )
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    if (theme === "dark") return <Moon className="w-5 h-5" />
    if (theme === "light") return <Sun className="w-5 h-5" />
    return <Monitor className="w-5 h-5" />
  }

  const getLabel = () => {
    if (theme === "dark") return "Dark mode (click for system)"
    if (theme === "light") return "Light mode (click for dark)"
    return "System mode (click for light)"
  }

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "p-2 text-muted-foreground hover:text-foreground transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
      )}
      title={getLabel()}
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  )
}
