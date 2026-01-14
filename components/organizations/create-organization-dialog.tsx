"use client"

import { createOrganization } from "@/lib/actions/organizations"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Plus, Building2 } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingButton } from "@/components/ui/loading-button"
import { toast } from "sonner"

export function CreateOrganizationDialog() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await createOrganization(formData)

      if ("error" in result) {
        setError(result.error)
        toast.error("Failed to create organization", {
          description: result.error,
        })
        return
      }

      toast.success("Organization created successfully")
      setIsOpen(false)
      router.push("/dashboard/organizations")
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all hover:shadow-md"
        aria-label="Create new organization"
      >
        <Plus className="w-5 h-5" />
        <span>New Organization</span>
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          setError(null)
        }}
        title="Create Organization"
        maxWidth="2xl"
        headerIcon={<Building2 className="w-5 h-5 text-primary" aria-hidden="true" />}
        footer={
          <div className="flex gap-3">
            <LoadingButton
              form="create-organization-form"
              type="submit"
              isLoading={isPending}
              loadingText="Creating..."
              variant="primary"
              className="flex-1"
            >
              Create Organization
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

        <form id="create-organization-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="organization-name" className="block text-sm font-semibold text-foreground mb-1">
              Organization Name *
            </label>
            <input
              id="organization-name"
              name="name"
              type="text"
              required
              maxLength={100}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="e.g., Acme Corp"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              A URL-friendly slug will be generated automatically from the name
            </p>
          </div>
        </form>
      </Dialog>
    </>
  )
}
