import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Code2, LogOut, Plus, Search } from "lucide-react"
import Link from "next/link"
import { signOut } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Code2 className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">DevSync</span>
              </Link>
              
              <div className="hidden md:flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Snippets
                </Link>
                <Link 
                  href="/dashboard/collections" 
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Collections
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/snippets/new"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                <span>New Snippet</span>
              </Link>
              
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>{session.user.name || session.user.email}</span>
              </div>
              
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <button
                  type="submit"
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
