import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { acceptInvite, declineInvite } from "@/lib/actions/organizations"
import { Building2, CheckCircle2, XCircle, Mail } from "lucide-react"
import { formatRelativeDate } from "@/lib/utils"
import { InviteActions } from "@/components/invite/invite-actions"

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/invite/${(await params).token}`)
  }

  const { token } = await params

  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
    include: {
      organization: true,
      invitedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!invite) {
    notFound()
  }

  // Check if expired
  const isExpired = invite.expiresAt < new Date()

  // Check if email matches
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  })

  const emailMatches = user?.email.toLowerCase() === invite.email.toLowerCase()

  // Check if already a member
  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: invite.organizationId,
      },
    },
  })

  const isAlreadyMember = !!existingMember

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/3 p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-6">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Organization Invitation</h1>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          {isExpired ? (
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 bg-destructive/10 rounded-full">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Invitation Expired</h2>
                <p className="text-muted-foreground">
                  This invitation expired on {formatRelativeDate(invite.expiresAt)}. Please ask for a new invitation.
                </p>
              </div>
            </div>
          ) : !emailMatches ? (
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 bg-warning/10 rounded-full">
                <Mail className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Email Mismatch</h2>
                <p className="text-muted-foreground">
                  This invitation was sent to <strong>{invite.email}</strong>, but you're signed in as <strong>{user?.email}</strong>.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please sign in with the correct email address to accept this invitation.
                </p>
              </div>
            </div>
          ) : isAlreadyMember ? (
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 bg-primary/10 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Already a Member</h2>
                <p className="text-muted-foreground">
                  You're already a member of <strong>{invite.organization.name}</strong>.
                </p>
                <a
                  href="/dashboard"
                  className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Join {invite.organization.name}
                </h2>
                <p className="text-muted-foreground">
                  {invite.invitedBy.name || invite.invitedBy.email} invited you to join this organization as a <strong className="capitalize">{invite.role.toLowerCase()}</strong>.
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <InviteActions
                  token={token}
                  organizationName={invite.organization.name}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
