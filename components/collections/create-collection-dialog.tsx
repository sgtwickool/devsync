"use client"

import { createCollection } from "@/lib/actions/collections"
import { useRouter } from "next/navigation"
import { useState, useTransition, useEffect } from "react"
import { Plus, Sparkles, Building2 } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingButton } from "@/components/ui/loading-button"
import { toast } from "sonner"

export function CreateCollectionDialog() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [organizationId, setOrganizationId] = useState<string>("")
  const [organizations, setOrganizations] = useState<Array<{ organization: { id: string; name: string; slug: string } }>>([])

  // Fetch user's organizations
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/organizations")
        if (response.ok) {
          const data = await response.json()
          setOrganizations(data)
        }
      } catch {
        // Silently fail - organizations are optional
      }
    }
    if (isOpen) {
      fetchOrganizations()
    }
  }, [isOpen])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    if (organizationId) {
      formData.append("organizationId", organizationId)
    }
    
    startTransition(async () => {
      const result = await createCollection(formData)

      if ("error" in result) {
        setError(result.error)
        toast.error("Failed to create collection", {
          description: result.error,
        })
        return
      }

      toast.success("Collection created successfully")
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
          {/* Organization Selector */}
          {organizations.length > 0 && (
            <div className="space-y-2">
              <label
                htmlFor="collection-organizationId"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Building2 className="w-4 h-4 text-primary" aria-hidden="true" />
                Organization
                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </label>
              <select
                id="collection-organizationId"
                name="organizationId"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-input/80"
              >
                <option value="">Personal (My Collections)</option>
                {organizations.map(({ organization }) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Create this collection in an organization to share it with your team
              </p>
            </div>
          )}

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

