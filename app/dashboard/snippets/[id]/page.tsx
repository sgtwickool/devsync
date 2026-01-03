import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft, Calendar, Tag, Code2, Folder } from "lucide-react"
import Link from "next/link"
import { CodeViewer } from "@/components/snippets/code-viewer"
import { DeleteSnippetButton } from "@/components/snippets/delete-snippet-button"
import { EditSnippetDialog } from "@/components/snippets/edit-snippet-dialog"
import { CopyCodeButton } from "@/components/snippets/copy-code-button"
import { AddToCollectionButton } from "@/components/collections/add-to-collection-button"
import { formatFullDate, getLanguageColor } from "@/lib/utils"

export default async function SnippetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const snippet = await prisma.snippet.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      collections: {
        include: {
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          collections: true,
        },
      },
    },
  })

  if (!snippet) {
    notFound()
  }

  // Verify snippet belongs to user
  if (snippet.userId !== session.user.id) {
    redirect("/dashboard")
  }

  // Get all user collections for the "Add to collection" button
  const allCollections = await prisma.collection.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  const snippetCollectionIds = new Set(snippet.collections.map(sc => sc.collection.id))

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{snippet.title}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold border ${getLanguageColor(snippet.language)}`}>
              {snippet.language}
            </span>
          </div>
          {snippet.description && (
            <p className="text-muted-foreground text-lg">{snippet.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <EditSnippetDialog snippet={snippet} />
          <DeleteSnippetButton snippetId={snippet.id} />
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>Created {formatFullDate(snippet.createdAt)}</span>
        </div>
        {snippet.updatedAt.getTime() !== snippet.createdAt.getTime() && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Updated {formatFullDate(snippet.updatedAt)}</span>
          </div>
        )}
        {snippet.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4" aria-hidden="true" />
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
        {snippet.collections.length > 0 && (
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4" aria-hidden="true" />
            <div className="flex flex-wrap gap-1.5">
              {snippet.collections.map(({ collection }) => (
                <Link
                  key={collection.id}
                  href={`/dashboard/collections/${collection.id}`}
                  className="px-2 py-0.5 bg-accent text-accent-foreground rounded-md text-xs font-medium hover:bg-accent/80 transition-colors"
                >
                  {collection.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add to Collection */}
      {allCollections.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <AddToCollectionButton
            snippetId={snippet.id}
            collections={allCollections}
            snippetCollectionIds={snippetCollectionIds}
          />
        </div>
      )}

      {/* Code Viewer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" aria-hidden="true" />
            Code
          </h2>
          <CopyCodeButton code={snippet.code} />
        </div>
        <CodeViewer code={snippet.code} language={snippet.language} />
      </div>
    </div>
  )
}


