"use client"

import { reorderSnippetInCollection } from "@/lib/actions/collections"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ReorderSnippetButtonsProps {
  collectionId: string
  snippetId: string
  canMoveUp: boolean
  canMoveDown: boolean
}

export function ReorderSnippetButtons({
  collectionId,
  snippetId,
  canMoveUp,
  canMoveDown,
}: ReorderSnippetButtonsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleReorder(direction: "up" | "down") {
    startTransition(async () => {
      const result = await reorderSnippetInCollection(collectionId, snippetId, direction)

      if ("error" in result) {
        toast.error("Failed to reorder snippet", {
          description: result.error,
        })
        return
      }

      toast.success("Snippet reordered")
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => handleReorder("up")}
        disabled={!canMoveUp || isPending}
        className="inline-flex items-center justify-center w-8 h-8 p-1 text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Move snippet up"
        title="Move up"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : (
          <ChevronUp className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
      <button
        onClick={() => handleReorder("down")}
        disabled={!canMoveDown || isPending}
        className="inline-flex items-center justify-center w-8 h-8 p-1 text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Move snippet down"
        title="Move down"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
