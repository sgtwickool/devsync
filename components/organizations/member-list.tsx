"use client"

import { useState, useTransition } from "react"
import { User, Crown, Shield, UserCircle, MoreVertical, Trash2, UserCog } from "lucide-react"
import { removeMember, updateMemberRole } from "@/lib/actions/organizations"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
import type { MemberRole } from "@prisma/client"

interface Member {
  id: string
  role: MemberRole
  joinedAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface MemberListProps {
  members: Member[]
  currentUserId: string
  currentUserRole: MemberRole
  organizationId: string
}

const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: UserCircle,
} as const

const roleLabels = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
} as const

export function MemberList({
  members,
  currentUserId,
  currentUserRole,
  organizationId,
}: MemberListProps) {
  const [isPending, startTransition] = useTransition()
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [removeConfirm, setRemoveConfirm] = useState<{
    userId: string
    userName: string
  } | null>(null)

  function handleRemoveMemberClick(userId: string, userName: string) {
    setRemoveConfirm({ userId, userName })
    setExpandedMember(null)
  }

  function handleRemoveMemberConfirm() {
    if (!removeConfirm) return

    startTransition(async () => {
      const result = await removeMember(organizationId, removeConfirm.userId)

      if ("error" in result) {
        toast.error("Failed to remove member", {
          description: result.error,
        })
        setRemoveConfirm(null)
        return
      }

      toast.success("Member removed successfully")
      setRemoveConfirm(null)
    })
  }

  function handleUpdateRole(userId: string, newRole: MemberRole, userName: string) {
    startTransition(async () => {
      const result = await updateMemberRole(organizationId, userId, newRole)

      if ("error" in result) {
        toast.error("Failed to update role", {
          description: result.error,
        })
        return
      }

      toast.success(`${userName}'s role updated successfully`)
      setExpandedMember(null)
    })
  }

  const canManageMembers = currentUserRole === "OWNER" || currentUserRole === "ADMIN"
  const isOwner = currentUserRole === "OWNER"

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const RoleIcon = roleIcons[member.role]
        const isCurrentUser = member.user.id === currentUserId
        const canModify = canManageMembers && !isCurrentUser && member.role !== "OWNER"

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name || member.user.email}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">
                    {member.user.name || member.user.email}
                  </p>
                  {isCurrentUser && (
                    <span className="text-xs text-muted-foreground">(You)</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{member.user.email}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{roleLabels[member.role]}</span>
                </div>

                {canModify && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setExpandedMember(expandedMember === member.id ? null : member.id)
                      }
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                      aria-label="Member options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {expandedMember === member.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setExpandedMember(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
                          {isOwner && member.role !== "ADMIN" && (
                            <button
                              onClick={() =>
                                handleUpdateRole(
                                  member.user.id,
                                  "ADMIN",
                                  member.user.name || member.user.email
                                )
                              }
                              className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                              disabled={isPending}
                            >
                              <Shield className="w-4 h-4" />
                              Make Admin
                            </button>
                          )}
                          {isOwner && member.role === "ADMIN" && (
                            <button
                              onClick={() =>
                                handleUpdateRole(
                                  member.user.id,
                                  "MEMBER",
                                  member.user.name || member.user.email
                                )
                              }
                              className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                              disabled={isPending}
                            >
                              <UserCircle className="w-4 h-4" />
                              Make Member
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleRemoveMemberClick(
                                member.user.id,
                                member.user.name || member.user.email
                              )
                            }
                            className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                            disabled={isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      <ConfirmDialog
        isOpen={!!removeConfirm}
        onClose={() => setRemoveConfirm(null)}
        onConfirm={handleRemoveMemberConfirm}
        title="Remove Member"
        description={
          removeConfirm
            ? `Are you sure you want to remove ${removeConfirm.userName} from this organization?`
            : ""
        }
        confirmText="Remove Member"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isPending}
      />
    </div>
  )
}
