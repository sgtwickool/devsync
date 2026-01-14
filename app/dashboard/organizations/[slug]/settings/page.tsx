import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getUserRoleInOrganization } from "@/lib/utils/permissions"
import { OrganizationSettings } from "@/components/organizations/organization-settings"

export default async function OrganizationSettingsPage({
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

  const canEdit = userRole === "OWNER" || userRole === "ADMIN"
  const canDelete = userRole === "OWNER"

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <OrganizationSettings
        organization={organization}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  )
}
