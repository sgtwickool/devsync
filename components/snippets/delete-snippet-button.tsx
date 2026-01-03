"use client"

import { deleteSnippet } from "@/lib/actions/snippets"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Trash2, Loader2 } from "lucide-react"

interface DeleteSnippetButtonProps {
  snippetId: string
}

export function DeleteSnippetButton({ snippetId }: DeleteSnippetButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    startTransition(async () => {
      const result = await deleteSnippet(snippetId)
      
      if ("error" in result) {
        alert(result.error)
        return
      }

      router.push("/dashboard")
      router.refresh()
    })
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Deleting...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Confirm Delete</span>
            </>
          )}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="px-4 py-2 text-foreground bg-card border border-border rounded-lg font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 transition-all"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 px-4 py-2 text-destructive bg-card border border-destructive/20 rounded-lg font-medium hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
      aria-label="Delete snippet"
    >
      <Trash2 className="w-4 h-4" aria-hidden="true" />
      <span>Delete</span>
    </button>
  )
}

