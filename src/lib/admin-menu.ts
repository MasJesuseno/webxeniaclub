// Definisi menu admin + kunci permission untuk Role-Based Access Control (RBAC).
// File ini murni (tanpa import server/prisma) sehingga aman dipakai di:
// - Server Components (admin layout)
// - Client Components (admin sidebar, role manager)
// - Edge Runtime (proxy.ts)

export const ALL_PERMISSIONS = "*"

export interface AdminMenuItem {
  key: string
  label: string
  href: string
  icon: string
}

export interface AdminMenuSection {
  section: string
  items: AdminMenuItem[]
}

export const ADMIN_MENU: AdminMenuSection[] = [
  {
    section: "Utama",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      { key: "sos", label: "SOS", href: "/admin/sos", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
    ],
  },
  {
    section: "Konten",
    items: [
      { key: "posts", label: "Postingan", href: "/admin/posts", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
      { key: "categories", label: "Kategori", href: "/admin/categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
      { key: "pages", label: "Halaman", href: "/admin/pages", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      { key: "menus", label: "Menu", href: "/admin/menus", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
    ],
  },
  {
    section: "Media",
    items: [
      { key: "albums", label: "Album", href: "/admin/albums", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { key: "gallery", label: "Galeri", href: "/admin/gallery", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { key: "testimonials", label: "Testimoni", href: "/admin/testimonials", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
      { key: "partners", label: "Mitra", href: "/admin/partners", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
      { key: "financial-reports", label: "Lap. Keuangan", href: "/admin/financial-reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    ],
  },
  {
    section: "Properti",
    items: [
      { key: "barang", label: "Master Barang", href: "/admin/barang", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
      { key: "barang-masuk-keluar", label: "Masuk/Keluar Barang", href: "/admin/barang-masuk-keluar", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
    ],
  },
  {
    section: "Member",
    items: [
      { key: "comments", label: "Komentar", href: "/admin/comments", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
      { key: "prospective-members", label: "Data Member", href: "/admin/prospective-members", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
      { key: "regions", label: "Region", href: "/admin/regions", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
      { key: "contacts", label: "Pesan Masuk", href: "/admin/contacts", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    ],
  },
  {
    section: "REGISTER",
    items: [
      { key: "registration-periods", label: "Periode Register", href: "/admin/registration-periods", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { key: "registration-data", label: "Data Register", href: "/admin/registration-data", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
      { key: "buku-member", label: "Buku Member", href: "/admin/buku-member", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    ],
  },
  {
    section: "Pengaturan",
    items: [
      { key: "users", label: "Pengguna", href: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
      { key: "roles", label: "Role", href: "/admin/roles", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
      { key: "settings", label: "Pengaturan", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
      { key: "email-settings", label: "Email SMTP", href: "/admin/settings/email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    ],
  },
  {
    section: "Sistem",
    items: [
      { key: "backup", label: "Backup Database", href: "/admin/backup", icon: "M4 7v10c0 1.657 1.343 3 3 3h10c1.657 0 3-1.343 3-3V7c0-1.657-1.343-3-3-3H7c-1.657 0-3 1.343-3 3zM4 7h16M4 11h16M4 15h16" },
    ],
  },
]

/**
 * Cari kunci permission yang dibutuhkan untuk sebuah pathname /admin.
 * Menggunakan pencocokan prefix terpanjang sehingga sub-halaman
 * (mis. /admin/posts/create) ikut diatur oleh menu induknya.
 */
export function getRequiredMenuKey(pathname: string): string | null {
  let best: AdminMenuItem | null = null
  for (const section of ADMIN_MENU) {
    for (const item of section.items) {
      const isExact = pathname === item.href
      // Dashboard ("/admin") hanya cocok secara persis, jangan jadi prefix semua halaman.
      const isPrefix = item.href !== "/admin" && pathname.startsWith(item.href + "/")
      if ((isExact || isPrefix) && (!best || item.href.length > best.href.length)) {
        best = item
      }
    }
  }
  return best ? best.key : null
}

/**
 * Cek apakah sekumpulan permission mengizinkan akses ke sebuah pathname.
 * "*" berarti akses penuh. Pathname yang tidak dikenal /admin dianggap diizinkan.
 */
export function hasMenuAccess(permissions: string[], pathname: string): boolean {
  if (!Array.isArray(permissions)) return false
  if (permissions.includes(ALL_PERMISSIONS)) return true
  const required = getRequiredMenuKey(pathname)
  if (!required) return true
  return permissions.includes(required)
}

/**
 * Path admin pertama yang boleh diakses user (untuk redirect yang aman).
 * Mengembalikan "/" bila tidak ada menu yang boleh diakses.
 */
export function getFirstAllowedPath(permissions: string[]): string {
  if (!Array.isArray(permissions)) return "/"
  if (permissions.includes(ALL_PERMISSIONS)) return "/admin"
  for (const section of ADMIN_MENU) {
    for (const item of section.items) {
      if (permissions.includes(item.key)) return item.href
    }
  }
  return "/"
}

/**
 * Filter menu admin berdasarkan permission user (untuk sidebar).
 * Section yang tidak punya item yang diizinkan ikut disembunyikan.
 */
export function filterMenuByPermissions(permissions: string[]): AdminMenuSection[] {
  if (!Array.isArray(permissions)) return []
  if (permissions.includes(ALL_PERMISSIONS)) return ADMIN_MENU
  return ADMIN_MENU.map((section) => ({
    ...section,
    items: section.items.filter((item) => permissions.includes(item.key)),
  })).filter((section) => section.items.length > 0)
}
