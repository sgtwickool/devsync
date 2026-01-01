import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Search } from "lucide-react"
import Link from "next/link"

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Snippets</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search snippets..."
            className="pl-10 pr-4 py-2 w-64"
          />
        </div>
      </div>

      {snippets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No snippets yet. Create your first one!</p>
          <Link
            href="/dashboard/snippets/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Create Snippet
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {snippets.map((snippet) => (
            <Link
              key={snippet.id}
              href={`/dashboard/snippets/${snippet.id}`}
              className="block p-6 bg-white rounded-lg border hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {snippet.title}
                </h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {snippet.language}
                </span>
              </div>
              
              {snippet.description && (
                <p className="text-gray-600 text-sm mb-3">{snippet.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  {new Date(snippet.updatedAt).toLocaleDateString()}
                </span>
                {snippet.tags.length > 0 && (
                  <div className="flex gap-2">
                    {snippet.tags.map(({ tag }) => (
                      <span key={tag.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
