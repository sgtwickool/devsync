"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { acceptInvite, declineInvite } from "@/lib/actions/organizations"
import { CheckCircle2, XCircle } from "lucide-react"
import { LoadingButton } from "@/components/ui/loading-button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"

interface InviteActionsProps {
  token: string
  organizationName: string
}

export function InviteActions({ token, organizationName }: InviteActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false)

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInvite(token)

      if ("error" in result) {
        toast.error("Failed to accept invitation", {
          description: result.error,
        })
        return
      }

      toast.success(`You've joined ${organizationName}!`)
      router.push("/dashboard")
      router.refresh()
    })
  }

  function handleDeclineClick() {
    setShowDeclineConfirm(true)
  }

  function handleDeclineConfirm() {
    startTransition(async () => {
      const result = await declineInvite(token)

      if ("error" in result) {
        toast.error("Failed to decline invitation", {
          description: result.error,
        })
        setShowDeclineConfirm(false)
        return
      }

      toast.success("Invitation declined")
      router.push("/dashboard")
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <LoadingButton
        onClick={handleAccept}
        isLoading={isPending}
        loadingText="Joining..."
        variant="primary"
        className="flex-1"
      >
        <CheckCircle2 className="w-4 h-4" />
        Accept Invitation
      </LoadingButton>
      <LoadingButton
        onClick={handleDeclineClick}
        isLoading={isPending}
        loadingText="Declining..."
        variant="outline"
        className="flex-1"
      >
        <XCircle className="w-4 h-4" />
        Decline
      </LoadingButton>

      <ConfirmDialog
        isOpen={showDeclineConfirm}
        onClose={() => setShowDeclineConfirm(false)}
        onConfirm={handleDeclineConfirm}
        title="Decline Invitation"
        description="Are you sure you want to decline this invitation?"
        confirmText="Decline"
        cancelText="Cancel"
        variant="default"
        isLoading={isPending}
      />
    </div>
  )
}
