import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Code2, Calendar, Tag, Folder, Plus, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatRelativeDate, getLanguageColor } from "@/lib/utils"
import { SearchInput } from "@/components/dashboard/search-input"
import { TagFilter } from "@/components/dashboard/tag-filter"
import { OrganizationFilter } from "@/components/organizations/organization-filter"
import { OrganizationBadge } from "@/components/organizations/organization-badge"
import { buildSnippetWhereClause, getOrganizationFilterFromSearchParams } from "@/lib/utils/organization"
import { getUserAccessibleOrganizations } from "@/lib/utils/organization"
import { searchSnippetsComprehensive } from "@/lib/utils/search"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return <div>Please sign in to view your snippets.</div>
  }

  const params = await searchParams
  const searchQuery = params.q?.trim() || ""
  const tagFilter = params.tag?.trim() || ""
  const orgFilter = getOrganizationFilterFromSearchParams(params)

  // Get user's organizations for filter
  const userOrgs = await getUserAccessibleOrganizations(session.user.id)

  // Build base where clause for unified view (personal + org snippets)
  const baseWhere = await buildSnippetWhereClause(session.user.id, orgFilter)

  // Build tag filter
  const tagWhere = tagFilter
    ? {
        tags: {
          some: {
            tag: {
              name: tagFilter,
            },
          },
        },
      }
    : {}

  // Use full-text search if search query exists, otherwise use base where clause
  const searchWhere = searchQuery
    ? await searchSnippetsComprehensive(searchQuery, { ...baseWhere, ...tagWhere })
    : { ...baseWhere, ...tagWhere }

  // Get all tags for accessible snippets (scoped to current filter context)
  const allTags = await prisma.tag.findMany({
    where: {
      snippets: {
        some: {
          snippet: baseWhere,
        },
      },
    },
    include: {
      _count: {
        select: {
          snippets: {
            where: {
              snippet: baseWhere,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  // Fetch snippets with all needed data (including organization info)
  const snippets = await prisma.snippet.findMany({
    where: searchWhere,
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          collections: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  // Calculate stats (always show totals for current filter context)
  const totalSnippets = searchQuery
    ? await prisma.snippet.count({ where: baseWhere })
    : snippets.length

  // For tags and collections, calculate from all snippets if no search, otherwise use counts
  let totalTags: number
  let totalCollections: number

  if (searchQuery) {
    // When searching, we need separate queries for accurate totals
    const allSnippetsForStats = await prisma.snippet.findMany({
      where: baseWhere,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            collections: true,
          },
        },
      },
    })
    totalTags = new Set(allSnippetsForStats.flatMap((s) => s.tags.map((t) => t.tag.id))).size
    totalCollections = allSnippetsForStats.reduce((sum, s) => sum + s._count.collections, 0)
  } else {
    // When not searching, use the already-fetched snippets
    totalTags = new Set(snippets.flatMap((s) => s.tags.map((t) => t.tag.id))).size
    totalCollections = snippets.reduce((sum, s) => sum + s._count.collections, 0)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Snippets</h1>
            <p className="text-muted-foreground">
              {totalSnippets === 0 
                ? "Get started by creating your first code snippet"
                : `You have ${totalSnippets} ${totalSnippets === 1 ? 'snippet' : 'snippets'} saved`
              }
            </p>
      </div>

          <Link
            href="/dashboard/snippets/new"
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all hover:shadow-lg hover:shadow-primary/40 hover:scale-105 active:scale-100 self-start sm:self-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600/80 to-indigo-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">New Snippet</span>
          </Link>
        </div>

        {/* Stats Cards */}
        {totalSnippets > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="group relative bg-gradient-to-br from-card to-card/95 border border-border rounded-xl p-5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover-lift overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Code2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{totalSnippets}</p>
                  <p className="text-sm text-muted-foreground font-medium">Snippets</p>
                </div>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-card to-card/95 border border-border rounded-xl p-5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover-lift overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Tag className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{totalTags}</p>
                  <p className="text-sm text-muted-foreground font-medium">Tags</p>
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
                  <p className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{totalCollections}</p>
                  <p className="text-sm text-muted-foreground font-medium">Collections</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organization Filter */}
        {userOrgs.length > 0 && (
          <OrganizationFilter organizations={userOrgs} />
        )}

        {/* Search Bar */}
        {totalSnippets > 0 && <SearchInput />}

        {/* Tag Filter */}
        {totalSnippets > 0 && allTags.length > 0 && (
          <TagFilter tags={allTags} activeTag={tagFilter} />
        )}
      </div>

      {/* Content */}
      {snippets.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-card to-card/95 border-2 border-dashed border-border rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
          <div className="relative max-w-md mx-auto space-y-4">
            <div className="inline-flex p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full animate-float">
              <Sparkles className="w-12 h-12 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {searchQuery ? "No snippets found" : "No snippets yet"}
              </h2>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No snippets match "${searchQuery}". Try a different search term.`
                  : "Start building your code library by creating your first snippet. Save your favorite code patterns, utilities, and solutions for quick access."}
              </p>
            </div>
            {!searchQuery && (
              <Link
                href="/dashboard/snippets/new"
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all hover:shadow-lg hover:shadow-primary/40 hover:scale-105 active:scale-100 mt-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600/80 to-indigo-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative z-10">Create Your First Snippet</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {snippets.map((snippet, index) => (
            <Link
              key={snippet.id}
              href={`/dashboard/snippets/${snippet.id}`}
              className="group block bg-gradient-to-br from-card via-card to-purple-50/30 dark:to-purple-950/10 border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover-lift animate-fade-in relative overflow-hidden"
              style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-purple-500/0 to-primary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {snippet.title}
                </h3>
                      {snippet.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {snippet.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" aria-hidden="true" />
              </div>
              
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {snippet.organization && (
                      <OrganizationBadge
                        organizationName={snippet.organization.name}
                        size="sm"
                      />
                    )}
                    
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      <span>{formatRelativeDate(snippet.updatedAt)}</span>
                    </div>
                    
                {snippet.tags.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4" aria-hidden="true" />
                        <div className="flex flex-wrap gap-1.5">
                          {snippet.tags.slice(0, 3).map(({ tag }) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent text-accent-foreground rounded-md text-xs font-medium"
                            >
                              <span className="opacity-70">#</span>
                        {tag.name}
                      </span>
                    ))}
                          {snippet.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-muted-foreground">
                              +{snippet.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {snippet._count.collections > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Folder className="w-4 h-4" aria-hidden="true" />
                        <span>{snippet._count.collections} {snippet._count.collections === 1 ? 'collection' : 'collections'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getLanguageColor(snippet.language)}`}>
                    {snippet.language}
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
