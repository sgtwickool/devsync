import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft, Folder, Calendar, FileCode, Code2, Tag, ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog"
import { DeleteCollectionButton } from "@/components/collections/delete-collection-button"
import { AddSnippetToCollection } from "@/components/collections/add-snippet-to-collection"
import { RemoveSnippetFromCollection } from "@/components/collections/remove-snippet-from-collection"
import { ReorderSnippetButtons } from "@/components/collections/reorder-snippet-buttons"
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
        orderBy: [
          { order: "asc" as const },
          { addedAt: "asc" as const },
        ],
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
      <div className="bg-gradient-to-br from-card via-card to-primary/5 border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
                <Folder className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">{collection.name}</h1>
                <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-semibold border border-primary/20">
                  <span>Workflow</span>
                  <span className="opacity-70">•</span>
                  <span>{collection._count.snippets} {collection._count.snippets === 1 ? 'step' : 'steps'}</span>
                </div>
              </div>
            </div>
            {collection.description && (
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">{collection.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <EditCollectionDialog collection={collection} />
            <DeleteCollectionButton collectionId={collection.id} />
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border/50">
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
        <div className="space-y-4">
          {collection.snippets.map((snippetCollection, index) => {
            const snippet = snippetCollection.snippet
            const isFirst = index === 0
            const isLast = index === collection.snippets.length - 1
            const prevSnippet = !isFirst ? collection.snippets[index - 1] : null
            const nextSnippet = !isLast ? collection.snippets[index + 1] : null

            return (
              <div
                key={snippet.id}
                id={`snippet-${snippet.id}`}
                className="relative animate-fade-in scroll-mt-8"
                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
              >
                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border" aria-hidden="true" />
                )}

                <div className="relative bg-card border border-border rounded-xl p-6 space-y-4">
                  {/* Step Number Badge */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 text-primary font-bold text-lg">
                        {index + 1}
                      </div>
                      <ReorderSnippetButtons
                        collectionId={collection.id}
                        snippetId={snippet.id}
                        canMoveUp={!isFirst}
                        canMoveDown={!isLast}
                      />
                    </div>

                    <div className="flex-1 space-y-4 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/dashboard/snippets/${snippet.id}?from=collection&collectionId=${collection.id}`}
                        className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {snippet.title}
                      </Link>
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border ${getLanguageColor(snippet.language)}`}>
                              {snippet.language}
                            </span>
                          </div>
                          {snippet.description && (
                            <p className="text-muted-foreground">{snippet.description}</p>
                          )}
                          {snippet.tags.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                              <div className="flex flex-wrap gap-1.5">
                                {snippet.tags.map(({ tag }) => (
                                  <span
                                    key={tag.id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent text-accent-foreground rounded-md text-xs font-medium"
                                  >
                                    <span className="opacity-70">#</span>
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
                      <div>
                        <CodeViewer code={snippet.code} language={snippet.language} />
                      </div>

                    </div>
                  </div>
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

