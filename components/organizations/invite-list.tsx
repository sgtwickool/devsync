"use client"

import { useState, useTransition } from "react"
import { Mail, Clock, X } from "lucide-react"
import { revokeInvite } from "@/lib/actions/organizations"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
import { formatRelativeDate } from "@/lib/utils"

interface Invite {
  id: string
  email: string
  role: string
  expiresAt: Date
  createdAt: Date
  invitedBy: {
    id: string
    name: string | null
    email: string
  }
}

interface InviteListProps {
  invites: Invite[]
  organizationId: string
  currentUserId: string
}

export function InviteList({
  invites,
  organizationId,
  currentUserId,
}: InviteListProps) {
  const [isPending, startTransition] = useTransition()
  const [revokeConfirm, setRevokeConfirm] = useState<{
    inviteId: string
    email: string
  } | null>(null)

  function handleRevokeClick(inviteId: string, email: string) {
    setRevokeConfirm({ inviteId, email })
  }

  function handleRevokeConfirm() {
    if (!revokeConfirm) return

    startTransition(async () => {
      const result = await revokeInvite(revokeConfirm.inviteId)

      if ("error" in result) {
        toast.error("Failed to revoke invitation", {
          description: result.error,
        })
        setRevokeConfirm(null)
        return
      }

      toast.success("Invitation revoked successfully")
      setRevokeConfirm(null)
    })
  }

  return (
    <div className="space-y-3">
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{invite.email}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="capitalize">{invite.role.toLowerCase()}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expires {formatRelativeDate(invite.expiresAt)}</span>
                </div>
                <span>•</span>
                <span>Invited by {invite.invitedBy.name || invite.invitedBy.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleRevokeClick(invite.id, invite.email)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
            disabled={isPending}
            aria-label="Revoke invitation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      <ConfirmDialog
        isOpen={!!revokeConfirm}
        onClose={() => setRevokeConfirm(null)}
        onConfirm={handleRevokeConfirm}
        title="Revoke Invitation"
        description={
          revokeConfirm
            ? `Are you sure you want to revoke the invitation sent to ${revokeConfirm.email}?`
            : ""
        }
        confirmText="Revoke Invitation"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isPending}
      />
    </div>
  )
}
