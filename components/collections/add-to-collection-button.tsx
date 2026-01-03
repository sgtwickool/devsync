"use client"

import { addSnippetToCollection } from "@/lib/actions/collections"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { FolderPlus, Loader2, AlertCircle, ChevronDown, Check } from "lucide-react"

interface AddToCollectionButtonProps {
  snippetId: string
  collections: Array<{ id: string; name: string }>
  snippetCollectionIds: Set<string>
}

export function AddToCollectionButton({ snippetId, collections, snippetCollectionIds }: AddToCollectionButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = useState("")

  const availableCollections = collections.filter(c => !snippetCollectionIds.has(c.id))

  async function handleAdd() {
    if (!selectedCollectionId) {
      setError("Please select a collection")
      return
    }

    setError(null)
    setSuccess(false)
    
    startTransition(async () => {
      const result = await addSnippetToCollection(selectedCollectionId, snippetId)

      if ("error" in result) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setSelectedCollectionId("")
      setTimeout(() => {
        setSuccess(false)
        router.refresh()
      }, 1500)
    })
  }

  if (availableCollections.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FolderPlus className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">Add to Collection</span>
      </div>

      {error && (
        <div 
          className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg flex items-start gap-2 text-sm"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
          <Check className="w-4 h-4" aria-hidden="true" />
          <p>Added to collection!</p>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 pr-10 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="">Select collection...</option>
            {availableCollections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
          <ChevronDown 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
            aria-hidden="true"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={isPending || !selectedCollectionId}
          className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 transition-all"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <FolderPlus className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}

