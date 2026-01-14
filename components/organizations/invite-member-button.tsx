"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { InviteMemberDialog } from "./invite-member-dialog"

interface InviteMemberButtonProps {
  organizationId: string
}

export function InviteMemberButton({ organizationId }: InviteMemberButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all hover:shadow-md"
        aria-label="Invite member"
      >
        <UserPlus className="w-5 h-5" />
        <span>Invite Member</span>
      </button>
      <InviteMemberDialog
        organizationId={organizationId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
