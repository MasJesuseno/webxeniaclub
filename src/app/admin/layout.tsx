import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "./admin-sidebar"
import { getUserPermissions, getUserRoleBadges } from "@/lib/permissions"
import { hasMenuAccess, getFirstAllowedPath } from "@/lib/admin-menu"
import { RoleBadges } from "@/components/role-badge"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Pathname diteruskan dari proxy.ts via header (server component tidak
  // bisa membaca pathname secara langsung).
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || "/admin"

  // Pengecekan izin FRESH ke database per request — perubahan hak akses role
  // langsung berlaku tanpa harus login ulang.
  const [permissions, roleBadges] = await Promise.all([
    getUserPermissions(session.user.id),
    getUserRoleBadges(session.user.id),
  ])

  if (!hasMenuAccess(permissions, pathname)) {
    redirect(getFirstAllowedPath(permissions))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar user={{ ...session.user, permissions, roleBadges }} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Panel Admin DXIC</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {session.user.name || session.user.email}
              </span>
              <RoleBadges roles={roleBadges} />
            </span>
            <a
              href="/"
              target="_blank"
              className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Buka Website
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
