import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Search, Code2, Calendar, Tag, Folder, Plus, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatRelativeDate, getLanguageColor } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return <div>Please sign in to view your snippets.</div>
  }

  const snippets = await prisma.snippet.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      },
      _count: {
        select: {
          collections: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  const totalSnippets = snippets.length
  const totalTags = new Set(snippets.flatMap(s => s.tags.map(t => t.tag.id))).size
  const totalCollections = snippets.reduce((sum, s) => sum + s._count.collections, 0)

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
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all hover:shadow-md self-start sm:self-auto"
          >
            <Plus className="w-5 h-5" />
            <span>New Snippet</span>
          </Link>
        </div>

        {/* Stats Cards */}
        {totalSnippets > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSnippets}</p>
                  <p className="text-sm text-muted-foreground">Snippets</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Tag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalTags}</p>
                  <p className="text-sm text-muted-foreground">Tags</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Folder className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalCollections}</p>
                  <p className="text-sm text-muted-foreground">Collections</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {totalSnippets > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search snippets by title, language, or tags..."
              className="w-full pl-11 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              aria-label="Search snippets"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {snippets.length === 0 ? (
        <div className="text-center py-16 bg-card border-2 border-dashed border-border rounded-xl">
          <div className="max-w-md mx-auto space-y-4">
            <div className="inline-flex p-4 bg-primary/10 rounded-full">
              <Sparkles className="w-12 h-12 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">No snippets yet</h2>
              <p className="text-muted-foreground">
                Start building your code library by creating your first snippet. 
                Save your favorite code patterns, utilities, and solutions for quick access.
              </p>
            </div>
            <Link
              href="/dashboard/snippets/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all hover:shadow-md mt-6"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Snippet</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {snippets.map((snippet, index) => (
            <Link
              key={snippet.id}
              href={`/dashboard/snippets/${snippet.id}`}
              className="group block bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
            >
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
                              className="px-2 py-0.5 bg-accent text-accent-foreground rounded-md text-xs font-medium"
                            >
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
