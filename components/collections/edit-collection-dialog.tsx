"use client"

import { updateCollection } from "@/lib/actions/collections"
import { useRouter } from "next/navigation"
import { useState, useTransition, useEffect } from "react"
import { createPortal } from "react-dom"
import { Edit } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingButton } from "@/components/ui/loading-button"

interface EditCollectionDialogProps {
  collection: {
    id: string
    name: string
    description: string | null
  }
}

export function EditCollectionDialog({ collection }: EditCollectionDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await updateCollection(collection.id, formData)

      if ("error" in result) {
        setError(result.error)
        return
      }

      setIsOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-foreground bg-card border border-border rounded-lg font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
        aria-label="Edit collection"
      >
        <Edit className="w-4 h-4" aria-hidden="true" />
        <span>Edit</span>
      </button>

      {isOpen && mounted && (
        <Dialog
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false)
            setError(null)
          }}
          title="Edit Collection"
          maxWidth="2xl"
          footer={
            <div className="flex gap-3">
              <LoadingButton
                form="edit-collection-form"
                type="submit"
                isLoading={isPending}
                loadingText="Saving..."
                variant="primary"
                className="flex-1"
              >
                Save Changes
              </LoadingButton>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setError(null)
                }}
                disabled={isPending}
                className="px-6 py-3 text-foreground bg-card border border-border rounded-lg font-semibold hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
            </div>
          }
        >
          <ErrorAlert error={error || undefined} />

          <form id="edit-collection-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-collection-name" className="block text-sm font-semibold text-foreground mb-1">
                Name *
              </label>
              <input
                id="edit-collection-name"
                name="name"
                type="text"
                required
                defaultValue={collection.name}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="edit-collection-description" className="block text-sm font-semibold text-foreground mb-1">
                Description
                <span className="text-xs font-normal text-muted-foreground ml-2">(optional)</span>
              </label>
              <textarea
                id="edit-collection-description"
                name="description"
                rows={3}
                defaultValue={collection.description || ""}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="What is this collection for?"
              />
            </div>
          </form>
        </Dialog>
      )}
    </>
  )
}

