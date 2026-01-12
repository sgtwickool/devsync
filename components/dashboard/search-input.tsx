"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition, useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUpdatingRef = useRef(false)
  
  const queryFromUrl = searchParams.get("q") || ""
  const [value, setValue] = useState(queryFromUrl)
  const lastSyncedUrlRef = useRef(queryFromUrl)

  // Sync input value with URL param only when URL changes externally
  // (e.g., browser back/forward, not from our own updates)
  useEffect(() => {
    // Only sync if URL changed and we didn't initiate the change
    if (!isUpdatingRef.current && queryFromUrl !== lastSyncedUrlRef.current) {
      setValue(queryFromUrl)
      lastSyncedUrlRef.current = queryFromUrl
    }
  }, [queryFromUrl])

  function updateSearch(query: string): void {
    // Cancel any pending debounced search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const trimmedQuery = query.trim()
    const params = new URLSearchParams(searchParams.toString())
    
    if (trimmedQuery) {
      params.set("q", trimmedQuery)
    } else {
      params.delete("q")
    }

    isUpdatingRef.current = true
    startTransition(() => {
      router.replace(`/dashboard?${params.toString()}`)
      // Reset the flag after navigation completes
      // Use requestAnimationFrame to ensure it happens after React processes the update
      requestAnimationFrame(() => {
        setTimeout(() => {
          isUpdatingRef.current = false
          lastSyncedUrlRef.current = trimmedQuery || ""
        }, 50)
      })
    })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = e.target.value
    setValue(newValue)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce the search update
    timeoutRef.current = setTimeout(() => {
      updateSearch(newValue)
    }, 100)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    
    // Cancel any pending debounced search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Update immediately on form submit
    updateSearch(value)
  }

  function handleClear(): void {
    // Cancel any pending search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    setValue("")
    updateSearch("")
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md">
      <Search 
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" 
        aria-hidden="true" 
      />
      <input
        name="search"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search snippets by title, language, or tags..."
        className="w-full pl-11 pr-10 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm hover:shadow-md focus:shadow-lg"
        aria-label="Search snippets"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  )
}

