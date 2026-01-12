"use client"

import { removeSnippetFromCollection } from "@/lib/actions/collections"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface RemoveSnippetFromCollectionProps {
  collectionId: string
  snippetId: string
}

export function RemoveSnippetFromCollection({ collectionId, snippetId }: RemoveSnippetFromCollectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleRemoveConfirm() {
    startTransition(async () => {
      const result = await removeSnippetFromCollection(collectionId, snippetId)
      
      if ("error" in result) {
        toast.error("Failed to remove snippet", {
          description: result.error,
        })
        setShowConfirm(false)
        return
      }

      toast.success("Snippet removed from collection")
      setShowConfirm(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-destructive transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 rounded-lg"
        aria-label="Remove snippet from collection"
        title="Remove from collection"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleRemoveConfirm}
        title="Remove from Collection"
        description="Are you sure you want to remove this snippet from the collection?"
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isPending}
      />
    </>
  )
}

