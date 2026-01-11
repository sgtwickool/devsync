"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { X, Hash } from "lucide-react"

/**
 * Normalizes a tag name by removing # prefix, trimming, and lowercasing
 */
function normalizeTag(tagName: string): string {
  return tagName.replace(/^#+/, "").trim().toLowerCase()
}

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export function TagInput({ tags, onChange, placeholder = "Add tags...", maxTags = 10 }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(tagName: string) {
    const cleaned = normalizeTag(tagName)
    if (!cleaned || tags.includes(cleaned) || tags.length >= maxTags) {
      setInputValue("")
      return
    }

    onChange([...tags, cleaned])
    setInputValue("")
    
    // Keep focus on input after adding tag
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  function removeTag(tagToRemove: string) {
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
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
  }

  return (
    <div className="w-full">
      {tags.length === 0 ? (
        // When empty, render as a normal input with # prefix
        <div className="relative">
          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-sm"
          />
        </div>
      ) : (
        // When tags exist, render as tag container
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
          {tags.length < maxTags && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder=""
              className="flex-1 min-w-[120px] text-foreground placeholder:text-muted-foreground text-sm"
              style={{ 
                border: 'none', 
                outline: 'none', 
                boxShadow: 'none',
                background: 'transparent',
                padding: '0',
                margin: '0'
              }}
            />
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-1.5">
        Press Enter or comma to add tags. {tags.length}/{maxTags} tags
      </p>
    </div>
  )
}

