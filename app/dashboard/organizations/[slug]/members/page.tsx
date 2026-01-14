import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getOrganizationMembers, getOrganizationInvites } from "@/lib/actions/organizations"
import { getUserRoleInOrganization, hasOrganizationPermission } from "@/lib/utils/permissions"
import { MemberList } from "@/components/organizations/member-list"
import { InviteMemberButton } from "@/components/organizations/invite-member-button"
import { InviteList } from "@/components/organizations/invite-list"
import { UserPlus, Users, Mail, Clock } from "lucide-react"
import { formatRelativeDate } from "@/lib/utils"
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt"
import { checkMemberLimit } from "@/lib/actions/organizations"

export default async function OrganizationMembersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { slug } = await params

  const organization = await prisma.organization.findUnique({
    where: { slug },
  })

  if (!organization) {
    notFound()
  }

  const userRole = await getUserRoleInOrganization(session.user.id, organization.id)
  
  if (!userRole) {
    redirect("/dashboard/organizations")
  }

  const canManage = await hasOrganizationPermission(
    session.user.id,
    organization.id,
    "ADMIN"
  )

  const members = await getOrganizationMembers(organization.id)
  const invites = await getOrganizationInvites(organization.id)
  const limitCheck = await checkMemberLimit(organization.id)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Members</h1>
          <p className="text-muted-foreground">
            Manage team members and invitations for {organization.name}
          </p>
        </div>
        {canManage && (
          <div>
            {limitCheck.canAdd ? (
              <InviteMemberButton organizationId={organization.id} />
            ) : (
              <UpgradePrompt
                title="Member Limit Reached"
                description="You've reached the limit for FREE tier members. Upgrade to PRO for unlimited members."
              />
            )}
          </div>
        )}
      </div>

      {/* Members */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Team Members ({members.length})
          </h2>
        </div>
        <MemberList
          members={members}
          currentUserId={session.user.id}
          currentUserRole={userRole}
          organizationId={organization.id}
        />
      </div>

      {/* Pending Invites */}
      {canManage && invites.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Pending Invitations ({invites.length})
            </h2>
          </div>
          <InviteList
            invites={invites}
            organizationId={organization.id}
            currentUserId={session.user.id}
          />
        </div>
      )}
    </div>
  )
}
