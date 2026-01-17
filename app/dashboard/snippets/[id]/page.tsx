import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft, Calendar, Tag, Code2, Folder } from "lucide-react"
import Link from "next/link"
import { CodeViewer } from "@/components/snippets/code-viewer"
import { DeleteSnippetButton } from "@/components/snippets/delete-snippet-button"
import { EditSnippetDialog } from "@/components/snippets/edit-snippet-dialog"
import { CopyCodeButton } from "@/components/snippets/copy-code-button"
import { ShareLinkButton } from "@/components/snippets/share-link-button"
import { AddToCollectionButton } from "@/components/collections/add-to-collection-button"
import { formatFullDate, getLanguageColor } from "@/lib/utils"
import { canUserAccessSnippet } from "@/lib/utils/permissions"
import { OrganizationBadge } from "@/components/organizations/organization-badge"

export default async function SnippetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string; collectionId?: string }>
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
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      collections: {
        include: {
          collection: {
            select: {
              id: true,
              name: true,
              organizationId: true,
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

  // Check if user can access this snippet
  const canAccess = await canUserAccessSnippet(session.user.id, snippet)
  if (!canAccess) {
    redirect("/dashboard")
  }

  // Get all accessible collections (personal + org collections matching snippet context)
  let collectionWhere: any
  
  if (snippet.organizationId === null) {
    // Personal snippet - only show personal collections
    collectionWhere = {
      userId: session.user.id,
      organizationId: null,
    }
  } else {
    // Org snippet - only show collections from same org
    collectionWhere = {
      organizationId: snippet.organizationId,
      organization: {
        members: {
          some: { userId: session.user.id },
        },
      },
    }
  }

  const allCollections = await prisma.collection.findMany({
    where: collectionWhere,
    include: {
      organization: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  const snippetCollectionIds = new Set(snippet.collections.map(sc => sc.collection.id))
  
  // Get organization info for current collections
  const currentCollections = await Promise.all(
    snippet.collections.map(async (sc) => {
      const org = sc.collection.organizationId
        ? await prisma.organization.findUnique({
            where: { id: sc.collection.organizationId },
            select: { name: true },
          })
        : null
      
      return {
        id: sc.collection.id,
        name: sc.collection.name,
        organizationId: sc.collection.organizationId,
        organization: org,
      }
    })
  )

  // Determine back navigation based on where user came from
  const { from, collectionId } = await searchParams
  let backHref = "/dashboard"
  let backLabel = "Back to Dashboard"

  if (from === "collection" && collectionId) {
    // Verify the collection exists and belongs to user
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { id: true, name: true, userId: true },
    })

    if (collection && collection.userId === session.user.id) {
      backHref = `/dashboard/collections/${collectionId}`
      backLabel = `Back to ${collection.name}`
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={backLabel}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">{backLabel}</span>
        </Link>
      </div>

      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-foreground">{snippet.title}</h1>
            {snippet.organization && (
              <OrganizationBadge organizationName={snippet.organization.name} />
            )}
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold border ${getLanguageColor(snippet.language)}`}>
              {snippet.language}
            </span>
          </div>
          {snippet.description && (
            <p className="text-muted-foreground text-lg">{snippet.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ShareLinkButton snippetId={snippet.id} isPublic={snippet.visibility === "PUBLIC"} />
          <EditSnippetDialog 
            snippet={{
              id: snippet.id,
              title: snippet.title,
              description: snippet.description,
              code: snippet.code,
              language: snippet.language,
              visibility: snippet.visibility,
              organizationId: snippet.organizationId,
              tags: snippet.tags,
            }} 
          />
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

      {/* Collections Management */}
      {allCollections.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <AddToCollectionButton
            snippetId={snippet.id}
            collections={allCollections}
            snippetCollectionIds={snippetCollectionIds}
            currentCollections={currentCollections}
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


