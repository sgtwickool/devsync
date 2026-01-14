"use client"

import { useState, useTransition } from "react"
import { updateOrganization, deleteOrganization } from "@/lib/actions/organizations"
import { useRouter } from "next/navigation"
import { Settings, Trash2, Save } from "lucide-react"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingButton } from "@/components/ui/loading-button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"

interface OrganizationSettingsProps {
  organization: {
    id: string
    name: string
    slug: string
  }
  canEdit: boolean
  canDelete: boolean
}

export function OrganizationSettings({
  organization,
  canEdit,
  canDelete,
}: OrganizationSettingsProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(organization.name)
  const [slug, setSlug] = useState(organization.slug)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await updateOrganization(organization.id, formData)

      if ("error" in result) {
        setError(result.error)
        toast.error("Failed to update organization", {
          description: result.error,
        })
        return
      }

      toast.success("Organization updated successfully")
      router.refresh()
    })
  }

  function handleDeleteClick() {
    setShowDeleteConfirm(true)
  }

  function handleDeleteConfirm() {
    startTransition(async () => {
      const result = await deleteOrganization(organization.id)

      if ("error" in result) {
        toast.error("Failed to delete organization", {
          description: result.error,
        })
        setShowDeleteConfirm(false)
        return
      }

      toast.success("Organization deleted successfully")
      router.push("/dashboard/organizations")
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Organization Settings</h2>
      </div>

      <ErrorAlert error={error || undefined} />

      {canEdit && (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="org-name" className="block text-sm font-semibold text-foreground mb-1">
              Organization Name *
            </label>
            <input
              id="org-name"
              name="name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="org-slug" className="block text-sm font-semibold text-foreground mb-1">
              URL Slug *
            </label>
            <input
              id="org-slug"
              name="slug"
              type="text"
              required
              pattern="[a-z0-9-]+"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-mono text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
            </p>
          </div>

          <div className="flex gap-3">
            <LoadingButton
              type="submit"
              isLoading={isPending}
              loadingText="Saving..."
              variant="primary"
              className="flex-1"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </LoadingButton>
          </div>
        </form>
      )}

      {canDelete && (
        <div className="pt-6 border-t border-border">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting this organization will permanently delete all snippets, collections, and
              data. This action cannot be undone.
            </p>
            <LoadingButton
              onClick={handleDeleteClick}
              isLoading={isPending}
              loadingText="Deleting..."
              variant="destructive"
            >
              <Trash2 className="w-4 h-4" />
              Delete Organization
            </LoadingButton>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Organization"
        description={`Are you sure you want to delete "${organization.name}"? This action cannot be undone and will delete all snippets, collections, and data in this organization.`}
        confirmText="Delete Organization"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isPending}
      />
    </div>
  )
}
