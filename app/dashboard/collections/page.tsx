import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Folder, Plus, Calendar, FileCode, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog"
import { OrganizationBadge } from "@/components/organizations/organization-badge"
import { OrganizationFilter } from "@/components/organizations/organization-filter"
import { getUserAccessibleOrganizations, getOrganizationFilterFromSearchParams } from "@/lib/utils/organization"
import { formatRelativeDate } from "@/lib/utils"

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const params = await searchParams
  const orgFilter = getOrganizationFilterFromSearchParams(params)
  const userOrgs = await getUserAccessibleOrganizations(session.user.id)

  // Build where clause for collections
  let whereClause: any = {}

  if (orgFilter === "personal") {
    whereClause = {
      userId: session.user.id,
      organizationId: null,
    }
  } else if (orgFilter && orgFilter !== "personal") {
    // Filter by specific organization
    const org = await prisma.organization.findUnique({
      where: { slug: orgFilter },
      select: { id: true },
    })
    
    if (org) {
      // Check if user is member
      const isMember = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId: org.id,
          },
        },
      })
      
      if (isMember) {
        whereClause = {
          organizationId: org.id,
        }
      } else {
        whereClause = { id: "non-existent" } // Return empty
      }
    } else {
      whereClause = { id: "non-existent" } // Return empty
    }
  } else {
    // Show all: personal + org collections user has access to
    const orgIds = userOrgs.map((om) => om.organization.id)
    
    whereClause = {
      OR: [
        { userId: session.user.id, organizationId: null }, // Personal
        {
          organizationId: { in: orgIds },
          organization: {
            members: {
              some: { userId: session.user.id },
            },
          },
        }, // Org collections
      ],
    }
  }

  const collections = await prisma.collection.findMany({
    where: whereClause,
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          snippets: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Collections</h1>
          <p className="text-muted-foreground">
            {collections.length === 0 
              ? "Organize your snippets into logical groups"
              : `You have ${collections.length} ${collections.length === 1 ? 'collection' : 'collections'}`
            }
          </p>
        </div>
        
        <CreateCollectionDialog />
      </div>

      {/* Organization Filter */}
      {userOrgs.length > 0 && (
        <OrganizationFilter organizations={userOrgs} basePath="/dashboard/collections" />
      )}

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="text-center py-16 bg-card border-2 border-dashed border-border rounded-xl">
          <div className="max-w-md mx-auto space-y-4">
            <div className="inline-flex p-4 bg-primary/10 rounded-full">
              <Sparkles className="w-12 h-12 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">No collections yet</h2>
              <p className="text-muted-foreground">
                Create collections to organize your snippets into logical groups. 
                Perfect for onboarding guides, project-specific code, or workflow runbooks.
              </p>
            </div>
            <CreateCollectionDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              href={`/dashboard/collections/${collection.id}`}
              className="group block bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Folder className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {collection.name}
                    </h3>
                    {collection.organization && (
                      <OrganizationBadge organizationName={collection.organization.name} size="sm" />
                    )}
                  </div>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" aria-hidden="true" />
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {collection._count.snippets} {collection._count.snippets === 1 ? 'snippet' : 'snippets'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>{formatRelativeDate(collection.updatedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

