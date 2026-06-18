"use client";

import Link from "next/link";

export function MobileMenu({ menuItems, schoolName }: { menuItems: any[]; schoolName: string }) {
  return (
    <>
      <button
        id="mobile-menu-button"
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => {
          const menu = document.getElementById("mobile-menu");
          if (menu) menu.classList.toggle("hidden");
        }}
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div id="mobile-menu" className="hidden lg:hidden fixed inset-0 z-50 bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-primary-900">{schoolName}</span>
          <button
            onClick={() => {
              const menu = document.getElementById("mobile-menu");
              if (menu) menu.classList.add("hidden");
            }}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-1">
          <MobileNavLink href="/" label="Beranda" />
          <MobileNavLink href="/profil" label="Profil" />
          {menuItems.map((item: any) => (
            <div key={item.id}>
              <MobileNavLink
                href={item.page ? `/${item.page.slug}` : item.url || "#"}
                label={item.label}
              />
              {item.children.length > 0 && (
                <div className="ml-4 space-y-1">
                  {item.children.map((child: any) => (
                    <MobileNavLink
                      key={child.id}
                      href={child.page ? `/${child.page.slug}` : child.url || "#"}
                      label={child.label}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          <MobileNavLink href="/berita" label="Berita" />
          <MobileNavLink href="/galeri" label="Galeri" />
          <MobileNavLink href="/kontak" label="Kontak" />
        </nav>
      </div>
    </>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-900 rounded-lg font-medium transition-colors"
      onClick={() => {
        const menu = document.getElementById("mobile-menu");
        if (menu) menu.classList.add("hidden");
      }}
    >
      {label}
    </Link>
  );
}
