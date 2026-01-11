"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { Tag } from "lucide-react"

interface TagFilterProps {
  tags: Array<{ id: string; name: string; _count: { snippets: number } }>
  activeTag?: string
}

export function TagFilter({ tags, activeTag }: TagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleTagClick(tagName: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (tagName === activeTag) {
      params.delete("tag")
    } else {
      params.set("tag", tagName)
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  function clearTagFilter() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("tag")
    router.push(`/dashboard?${params.toString()}`)
  }

  if (tags.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">Filter by tag:</span>
        {activeTag && (
          <button
            onClick={clearTagFilter}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear tag filter"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag.name)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTag === tag.name
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-accent text-accent-foreground hover:bg-accent/80"
            }`}
            aria-pressed={activeTag === tag.name}
          >
            <span className="opacity-70">#</span>
            {tag.name}
            <span className="ml-1 opacity-70">({tag._count.snippets})</span>
          </button>
        ))}
      </div>
    </div>
  )
}

