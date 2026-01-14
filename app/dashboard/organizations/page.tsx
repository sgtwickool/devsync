import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getUserOrganizations } from "@/lib/actions/organizations"
import { CreateOrganizationDialog } from "@/components/organizations/create-organization-dialog"
import { Building2, Users, FileCode, Folder, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatRelativeDate } from "@/lib/utils"
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt"
import { checkWorkspaceLimit } from "@/lib/actions/organizations"

export default async function OrganizationsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const organizations = await getUserOrganizations(session.user.id)
  const limitCheck = await checkWorkspaceLimit(session.user.id)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your workspaces and collaborate with your team
          </p>
        </div>
        <div className="flex items-center gap-3">
          {limitCheck.canCreate ? (
            <CreateOrganizationDialog />
          ) : (
            <UpgradePrompt
              title="Workspace Limit Reached"
              description="You've reached the limit for FREE tier workspaces. Upgrade to PRO for unlimited workspaces."
            />
          )}
        </div>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-card to-card/95 border-2 border-dashed border-border rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
          <div className="relative max-w-md mx-auto space-y-4">
            <div className="inline-flex p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full animate-float">
              <Building2 className="w-12 h-12 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">No organizations yet</h2>
              <p className="text-muted-foreground">
                Create your first organization to start collaborating with your team
              </p>
            </div>
            {limitCheck.canCreate && (
              <div className="pt-4">
                <CreateOrganizationDialog />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {organizations.map(({ organization, role }) => (
            <Link
              key={organization.id}
              href={`/dashboard/organizations/${organization.slug}`}
              className="group block bg-gradient-to-br from-card via-card to-purple-50/30 dark:to-purple-950/10 border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover-lift relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-purple-500/0 to-primary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {organization.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created {formatRelativeDate(organization.createdAt)}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" aria-hidden="true" />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        <span>{organization._count.members} {organization._count.members === 1 ? 'member' : 'members'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <FileCode className="w-4 h-4" aria-hidden="true" />
                        <span>{organization._count.snippets} {organization._count.snippets === 1 ? 'snippet' : 'snippets'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Folder className="w-4 h-4" aria-hidden="true" />
                        <span>{organization._count.collections} {organization._count.collections === 1 ? 'collection' : 'collections'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-accent-foreground">
                      {role}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
