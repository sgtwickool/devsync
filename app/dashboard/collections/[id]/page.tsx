import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft, Folder, Calendar, FileCode, Code2, Tag } from "lucide-react"
import Link from "next/link"
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog"
import { DeleteCollectionButton } from "@/components/collections/delete-collection-button"
import { AddSnippetToCollection } from "@/components/collections/add-snippet-to-collection"
import { RemoveSnippetFromCollection } from "@/components/collections/remove-snippet-from-collection"
import { CodeViewer } from "@/components/snippets/code-viewer"
import { formatFullDate, getLanguageColor } from "@/lib/utils"

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      userId: true, // Include userId for authorization check
      snippets: {
        include: {
          snippet: {
            include: {
              tags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
        orderBy: {
          addedAt: 'asc',
        },
      },
      _count: {
        select: {
          snippets: true,
        },
      },
    },
  })

  if (!collection) {
    notFound()
  }

  // Verify collection belongs to user
  if (collection.userId !== session.user.id) {
    redirect("/dashboard/collections")
  }

  // Get all user snippets for the "Add to collection" dropdown
  const allSnippets = await prisma.snippet.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  // Get snippet IDs already in collection
  const snippetIdsInCollection = new Set(collection.snippets.map(sc => sc.snippet.id))
  const availableSnippets = allSnippets.filter(s => !snippetIdsInCollection.has(s.id))

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/collections"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to collections"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Collection Header */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Folder className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">{collection.name}</h1>
            </div>
            {collection.description && (
              <p className="text-muted-foreground text-lg">{collection.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <EditCollectionDialog collection={collection} />
            <DeleteCollectionButton collectionId={collection.id} />
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4" aria-hidden="true" />
            <span>
              {collection._count.snippets} {collection._count.snippets === 1 ? 'snippet' : 'snippets'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Created {formatFullDate(collection.createdAt)}</span>
          </div>
          {collection.updatedAt.getTime() !== collection.createdAt.getTime() && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>Updated {formatFullDate(collection.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Snippets List */}
      {collection.snippets.length === 0 ? (
        <div className="text-center py-16 bg-card border-2 border-dashed border-border rounded-xl">
          <div className="max-w-md mx-auto space-y-4">
            <div className="inline-flex p-4 bg-primary/10 rounded-full">
              <FileCode className="w-12 h-12 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">No snippets yet</h2>
              <p className="text-muted-foreground">
                {availableSnippets.length > 0 
                  ? "Add snippets to this collection to get started."
                  : "Create some snippets first, then add them to this collection."
                }
              </p>
            </div>
            {availableSnippets.length > 0 && (
              <AddSnippetToCollection 
                collectionId={collection.id} 
                availableSnippets={availableSnippets}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {collection.snippets.map((snippetCollection, index) => {
            const snippet = snippetCollection.snippet
            return (
              <div
                key={snippet.id}
                className="bg-card border border-border rounded-xl p-6 space-y-4 animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {index + 1}.
                      </span>
                      <Link
                        href={`/dashboard/snippets/${snippet.id}`}
                        className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {snippet.title}
                      </Link>
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border ${getLanguageColor(snippet.language)}`}>
                        {snippet.language}
                      </span>
                    </div>
                    {snippet.description && (
                      <p className="text-muted-foreground ml-8">{snippet.description}</p>
                    )}
                    {snippet.tags.length > 0 && (
                      <div className="flex items-center gap-2 ml-8">
                        <Tag className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <div className="flex flex-wrap gap-1.5">
                          {snippet.tags.map(({ tag }) => (
                            <span
                              key={tag.id}
                              className="px-2 py-0.5 bg-accent text-accent-foreground rounded-md text-xs font-medium"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <RemoveSnippetFromCollection
                    collectionId={collection.id}
                    snippetId={snippet.id}
                  />
                </div>

                {/* Code Preview */}
                <div className="ml-8">
                  <CodeViewer code={snippet.code} language={snippet.language} />
                </div>
              </div>
            )
          })}

          {/* Add More Snippets Section - Only show when there are existing snippets and more available */}
          {availableSnippets.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <AddSnippetToCollection 
                collectionId={collection.id} 
                availableSnippets={availableSnippets}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

