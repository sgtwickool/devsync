"use client"

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react"
import { X, Hash, Loader2 } from "lucide-react"
import { normalizeTag } from "@/lib/utils/tags"

interface TagSuggestion {
  id: string
  name: string
  count: number
}

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  organizationId?: string | null
}

export function TagInput({ 
  tags, 
  onChange, 
  placeholder = "Add tags...", 
  maxTags = 10,
  organizationId = null,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch suggestions when input changes
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({ q: query })
      if (organizationId) {
        params.set("organizationId", organizationId)
      }
      
      const response = await fetch(`/api/tags?${params}`)
      if (response.ok) {
        const data = await response.json()
        // Filter out tags that are already selected
        const filtered = data.filter((tag: TagSuggestion) => !tags.includes(tag.name))
        setSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
        setSelectedIndex(-1)
      }
    } catch (error) {
      console.error("Failed to fetch tag suggestions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [organizationId, tags])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (inputValue.trim()) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(inputValue)
      }, 200)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [inputValue, fetchSuggestions])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function addTag(tagName: string): void {
    const cleaned = normalizeTag(tagName)
    if (!cleaned || tags.includes(cleaned) || tags.length >= maxTags) {
      setInputValue("")
      setShowSuggestions(false)
      return
    }

    onChange([...tags, cleaned])
    setInputValue("")
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    
    // Keep focus on input after adding tag
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  function removeTag(tagToRemove: string): void {
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  function selectSuggestion(suggestion: TagSuggestion): void {
    addTag(suggestion.name)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setShowSuggestions(false)
        setSelectedIndex(-1)
        return
      }
      if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault()
        selectSuggestion(suggestions[selectedIndex])
        return
      }
    }

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>): void {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const tagNames = pastedText
      .split(/[,\s]+/)
      .map(normalizeTag)
      .filter((t) => t.length > 0)

    const newTags = [...tags]
    for (const tagName of tagNames) {
      if (!newTags.includes(tagName) && newTags.length < maxTags) {
        newTags.push(tagName)
      }
    }
    onChange(newTags)
    setInputValue("")
    setShowSuggestions(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setInputValue(e.target.value)
  }

  function handleFocus(): void {
    if (inputValue.trim() && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const inputElement = (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
      placeholder={tags.length === 0 ? placeholder : ""}
      autoComplete="off"
      className={tags.length === 0 
        ? "w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-sm"
        : "flex-1 min-w-[120px] text-foreground placeholder:text-muted-foreground text-sm border-none outline-none shadow-none bg-transparent p-0 m-0"
      }
      style={tags.length > 0 ? { 
        border: 'none', 
        outline: 'none', 
        boxShadow: 'none',
        background: 'transparent',
        padding: '0',
        margin: '0'
      } : undefined}
    />
  )

  const suggestionsDropdown = showSuggestions && (
    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center py-3 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : (
        <ul className="py-1" role="listbox">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              role="option"
              aria-selected={index === selectedIndex}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => selectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{suggestion.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {suggestion.count} {suggestion.count === 1 ? "snippet" : "snippets"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    <div className="w-full" ref={containerRef}>
      {tags.length === 0 ? (
        // When empty, render as a normal input with # prefix
        <div className="relative">
          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          {inputElement}
          {suggestionsDropdown}
        </div>
      ) : (
        // When tags exist, render as tag container
        <div className="relative">
          <div className="flex flex-wrap gap-2 p-3 min-h-[48px] bg-background border border-input rounded-xl focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent text-accent-foreground rounded-lg text-sm font-medium"
              >
                <Hash className="w-3 h-3 opacity-70" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-accent-foreground/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {tags.length < maxTags && inputElement}
          </div>
          {suggestionsDropdown}
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-1.5">
        Press Enter or comma to add tags. {tags.length}/{maxTags} tags
      </p>
    </div>
  )
}
