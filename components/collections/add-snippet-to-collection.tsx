"use client"

import { addSnippetToCollection } from "@/lib/actions/collections"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Plus, Loader2, AlertCircle, ChevronDown } from "lucide-react"

interface AddSnippetToCollectionProps {
  collectionId: string
  availableSnippets: Array<{ id: string; title: string }>
}

export function AddSnippetToCollection({ collectionId, availableSnippets }: AddSnippetToCollectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedSnippetId, setSelectedSnippetId] = useState("")

  async function handleAdd() {
    if (!selectedSnippetId) {
      setError("Please select a snippet")
      return
    }

    setError(null)
    
    startTransition(async () => {
      const result = await addSnippetToCollection(collectionId, selectedSnippetId)

      if ("error" in result) {
        setError(result.error)
        return
      }

      setSelectedSnippetId("")
      router.refresh()
    })
  }

  if (availableSnippets.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Plus className="w-5 h-5 text-primary" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">Add Snippet</h3>
      </div>

      {error && (
        <div 
          className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={selectedSnippetId}
            onChange={(e) => setSelectedSnippetId(e.target.value)}
            disabled={isPending}
            className="w-full px-4 py-2 pr-10 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="">Select a snippet...</option>
            {availableSnippets.map((snippet) => (
              <option key={snippet.id} value={snippet.id}>
                {snippet.title}
              </option>
            ))}
          </select>
          <ChevronDown 
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" 
            aria-hidden="true"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={isPending || !selectedSnippetId}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

