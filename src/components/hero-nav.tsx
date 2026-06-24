"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MobileMenu } from "@/components/mobile-menu"

interface MenuItem {
  id: string
  label: string
  url: string | null
  pageId: string | null
  page: { title: string; slug: string } | null
  children: MenuItem[]
}

interface HeroNavProps {
  clubName: string
  shortName: string
  logo?: string | null
  primaryColor?: string
  menuItems?: MenuItem[]
  slogan?: string
}

export function HeroNav({ clubName, shortName, logo, primaryColor, menuItems, slogan }: HeroNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (item: MenuItem) => {
    const href = item.url || (item.page ? `/${item.page.slug}` : "#")
    return pathname === href
  }

  return (
    <>
      {/* Top Bar */}
      <div className="dxic-gradient text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <span className="font-medium">{slogan || "Xenia Menyatukan Kita"}</span>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">Instagram</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">YouTube</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">Facebook</a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {logo ? (
                <img src={logo} alt={shortName} className="h-12 w-auto" />
              ) : (
                <div className="w-12 h-12 dxic-gradient rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:shadow-lg transition-shadow">
                  {shortName?.charAt(0) || "D"}
                </div>
              )}
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl text-gray-900">{shortName}</h1>
                <p className="text-xs text-gray-500 -mt-1">{clubName}</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === "/"
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                }`}
              >
                Beranda
              </Link>
              {(menuItems || []).map((item) => {
                const href = item.url || (item.page ? `/${item.page.slug}` : "#")
                return (
                  <div key={item.id} className="relative group">
                    <Link
                      href={href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                        isActive(item)
                          ? "bg-red-50 text-red-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                      }`}
                    >
                      {item.label}
                      {item.children && item.children.length > 0 && (
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </Link>
                    {item.children && item.children.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] py-2 z-50">
                        {item.children.map((child) => {
                          const childHref = child.url || (child.page ? `/${child.page.slug}` : "#")
                          return (
                            <Link
                              key={child.id}
                              href={childHref}
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
              <Link
                href="/berita"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith("/berita")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                }`}
              >
                Berita
              </Link>
              <Link
                href="/galeri"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith("/galeri")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                }`}
              >
                Galeri
              </Link>
              <Link
                href="/kontak"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith("/kontak")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                }`}
              >
                Kontak
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Buka menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        clubName={clubName}
        shortName={shortName}
        menuItems={menuItems || []}
      />
    </>
  )
}
