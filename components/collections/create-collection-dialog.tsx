"use client"

import { createCollection } from "@/lib/actions/collections"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Plus, Sparkles } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingButton } from "@/components/ui/loading-button"

export function CreateCollectionDialog() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await createCollection(formData)

      if ("error" in result) {
        setError(result.error)
        return
      }

      setIsOpen(false)
      router.push(`/dashboard/collections/${result.collectionId}`)
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all hover:shadow-md self-start sm:self-auto"
        aria-label="Create new collection"
      >
        <Plus className="w-5 h-5" />
        <span>New Collection</span>
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          setError(null)
        }}
        title="Create Collection"
        maxWidth="2xl"
        headerIcon={<Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />}
        footer={
          <div className="flex gap-3">
            <LoadingButton
              form="create-collection-form"
              type="submit"
              isLoading={isPending}
              loadingText="Creating..."
              variant="primary"
              className="flex-1"
            >
              Create Collection
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

        <form id="create-collection-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="collection-name" className="block text-sm font-semibold text-foreground mb-1">
              Name *
            </label>
            <input
              id="collection-name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="e.g., New Developer Setup"
            />
          </div>

          <div>
            <label htmlFor="collection-description" className="block text-sm font-semibold text-foreground mb-1">
              Description
              <span className="text-xs font-normal text-muted-foreground ml-2">(optional)</span>
            </label>
            <textarea
              id="collection-description"
              name="description"
              rows={3}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="What is this collection for? e.g., Everything a new hire needs on day one"
            />
          </div>
        </form>
      </Dialog>
    </>
  )
}

