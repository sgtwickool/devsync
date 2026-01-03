"use client"

import { removeSnippetFromCollection } from "@/lib/actions/collections"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { X, Loader2 } from "lucide-react"

interface RemoveSnippetFromCollectionProps {
  collectionId: string
  snippetId: string
}

export function RemoveSnippetFromCollection({ collectionId, snippetId }: RemoveSnippetFromCollectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleRemove() {
    if (!confirm("Remove this snippet from the collection?")) {
      return
    }

    startTransition(async () => {
      const result = await removeSnippetFromCollection(collectionId, snippetId)
      
      if ("error" in result) {
        alert(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="inline-flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-destructive transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 rounded-lg"
      aria-label="Remove snippet from collection"
      title="Remove from collection"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        <X className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  )
}

