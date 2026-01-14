"use client"

import { inviteMember } from "@/lib/actions/organizations"
import { useState, useTransition } from "react"
import { UserPlus, Mail } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingButton } from "@/components/ui/loading-button"
import { toast } from "sonner"
import type { MemberRole } from "@prisma/client"

interface InviteMemberDialogProps {
  organizationId: string
  isOpen: boolean
  onClose: () => void
}

export function InviteMemberDialog({
  organizationId,
  isOpen,
  onClose,
}: InviteMemberDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await inviteMember(organizationId, formData)

      if ("error" in result) {
        setError(result.error)
        toast.error("Failed to send invitation", {
          description: result.error,
        })
        return
      }

      toast.success("Invitation sent successfully")
      onClose()
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        onClose()
        setError(null)
      }}
      title="Invite Member"
      maxWidth="md"
      headerIcon={<UserPlus className="w-5 h-5 text-primary" aria-hidden="true" />}
      footer={
        <div className="flex gap-3">
          <LoadingButton
            form="invite-member-form"
            type="submit"
            isLoading={isPending}
            loadingText="Sending..."
            variant="primary"
            className="flex-1"
          >
            Send Invitation
          </LoadingButton>
          <button
            type="button"
            onClick={() => {
              onClose()
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

      <form id="invite-member-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="invite-email" className="block text-sm font-semibold text-foreground mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="invite-email"
              name="email"
              type="email"
              required
              className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="colleague@example.com"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            They will receive an email invitation to join this organization
          </p>
        </div>

        <div>
          <label htmlFor="invite-role" className="block text-sm font-semibold text-foreground mb-1">
            Role *
          </label>
          <select
            id="invite-role"
            name="role"
            required
            defaultValue="MEMBER"
            className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="MEMBER">Member - Can create snippets</option>
            <option value="ADMIN">Admin - Can manage members</option>
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            Members can create and edit snippets. Admins can also manage team members.
          </p>
        </div>
      </form>
    </Dialog>
  )
}
