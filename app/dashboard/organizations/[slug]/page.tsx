import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getUserRoleInOrganization } from "@/lib/utils/permissions"
import { Building2, Users, FileCode, Folder, Settings, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatRelativeDate } from "@/lib/utils"

export default async function OrganizationDetailPage({
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
    include: {
      _count: {
        select: {
          members: true,
          snippets: true,
          collections: true,
        },
      },
    },
  })

  if (!organization) {
    notFound()
  }

  // Check if user is a member
  const userRole = await getUserRoleInOrganization(session.user.id, organization.id)
  
  if (!userRole) {
    redirect("/dashboard/organizations")
  }

  const canManage = userRole === "OWNER" || userRole === "ADMIN"

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{organization.name}</h1>
            <p className="text-muted-foreground">
              Created {formatRelativeDate(organization.createdAt)}
            </p>
          </div>
        </div>
        
        {canManage && (
          <Link
            href={`/dashboard/organizations/${slug}/settings`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg font-semibold hover:bg-accent transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="group relative bg-gradient-to-br from-card to-card/95 border border-border rounded-xl p-5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover-lift overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{organization._count.members}</p>
              <p className="text-sm text-muted-foreground font-medium">Members</p>
            </div>
          </div>
        </div>
        
        <div className="group relative bg-gradient-to-br from-card to-card/95 border border-border rounded-xl p-5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover-lift overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FileCode className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{organization._count.snippets}</p>
              <p className="text-sm text-muted-foreground font-medium">Snippets</p>
            </div>
          </div>
        </div>
        
        <div className="group relative bg-gradient-to-br from-card to-card/95 border border-border rounded-xl p-5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover-lift overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Folder className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{organization._count.collections}</p>
              <p className="text-sm text-muted-foreground font-medium">Collections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/dashboard/organizations/${slug}/members`}
          className="group block bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Manage Members</h3>
                <p className="text-sm text-muted-foreground">View and manage team members</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {canManage && (
          <Link
            href={`/dashboard/organizations/${slug}/settings`}
            className="group block bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Organization Settings</h3>
                  <p className="text-sm text-muted-foreground">Update name, slug, and more</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
