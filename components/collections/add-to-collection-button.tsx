"use client"

import { addSnippetToCollection, removeSnippetFromCollection } from "@/lib/actions/collections"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { FolderPlus, Loader2, AlertCircle, ChevronDown, X, Folder } from "lucide-react"
import { toast } from "sonner"

interface AddToCollectionButtonProps {
  snippetId: string
  collections: Array<{ id: string; name: string }>
  snippetCollectionIds: Set<string>
  currentCollections: Array<{ id: string; name: string }>
}

export function AddToCollectionButton({ 
  snippetId, 
  collections, 
  snippetCollectionIds,
  currentCollections 
}: AddToCollectionButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState("")

  const availableCollections = collections.filter(c => !snippetCollectionIds.has(c.id))

  async function handleAdd() {
    if (!selectedCollectionId) {
      setError("Please select a collection")
      return
    }

    setError(null)
    
    startTransition(async () => {
      const result = await addSnippetToCollection(selectedCollectionId, snippetId)

      if ("error" in result) {
        setError(result.error)
        toast.error("Failed to add snippet", {
          description: result.error,
        })
        return
      }

      toast.success("Snippet added to collection")
      setSelectedCollectionId("")
      router.refresh()
    })
  }

  async function handleRemove(collectionId: string, collectionName: string) {
    if (!confirm(`Remove this snippet from "${collectionName}"?`)) {
      return
    }

    startTransition(async () => {
      const result = await removeSnippetFromCollection(collectionId, snippetId)
      
      if ("error" in result) {
        toast.error("Failed to remove snippet", {
          description: result.error,
        })
        return
      }

      toast.success("Snippet removed from collection")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Current Collections */}
      {currentCollections.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">In Collections</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentCollections.map((collection) => (
              <div
                key={collection.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium border border-border"
              >
                <span>{collection.name}</span>
                <button
                  onClick={() => handleRemove(collection.id, collection.name)}
                  disabled={isPending}
                  className="inline-flex items-center justify-center w-4 h-4 rounded hover:bg-accent-foreground/20 transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  aria-label={`Remove from ${collection.name}`}
                  title={`Remove from ${collection.name}`}
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add to Collection */}
      {availableCollections.length > 0 ? (
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
      ) : currentCollections.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <p>No collections available. Create a collection to organise your snippets.</p>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          <p>This snippet is already in all your collections.</p>
        </div>
      )}
    </div>
  )
}
