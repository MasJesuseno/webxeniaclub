"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { filterMenuByPermissions } from "@/lib/admin-menu"
import { RoleBadges } from "@/components/role-badge"

interface AdminUser {
  id: string
  name?: string | null
  email?: string | null
  roles?: string[]
  permissions?: string[]
  roleBadges?: { name: string; displayName: string }[]
}

export function AdminSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Tampilkan hanya menu yang diizinkan untuk role user (RBAC)
  const visibleMenu = filterMenuByPermissions(user.permissions || [])

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 dxic-gradient-dark text-white transform transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } lg:block`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 dxic-gradient rounded-xl flex items-center justify-center text-white font-bold text-lg">
                D
              </div>
              <div>
                <h1 className="font-bold text-lg">DXIC</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {visibleMenu.map((section) => (
              <div key={section.section}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-3 mb-2">
                  {section.section}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? "bg-red-600/20 text-red-400"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                        </svg>
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
            {visibleMenu.length === 0 && (
              <p className="text-xs text-gray-500 px-3">Tidak ada menu yang bisa diakses.</p>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-white/10 px-4 py-4">
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <RoleBadges roles={user.roleBadges || []} />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400 truncate">
                {user.name || user.email}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "https://xeniaclub.or.id/login" })}
                className="p-2 rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-red-400"
                title="Keluar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  )
}
