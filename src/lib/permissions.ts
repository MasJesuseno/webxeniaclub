import { prisma } from "@/lib/prisma"
import { ALL_PERMISSIONS, ADMIN_MENU, hasMenuAccess } from "./admin-menu"

// Kumpulan kunci permission menu yang valid (untuk memvalidasi input dari form).
const VALID_MENU_KEYS = new Set(ADMIN_MENU.flatMap((section) => section.items.map((item) => item.key)))

/**
 * Ambil kumpulan permission menu admin milik seorang user langsung dari database
 * (fresh per-request). Role "super-admin" selalu mendapat akses penuh ("*")
 * sebagai jalur aman agar tidak terkunci.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: { permissions: { select: { permission: true } } },
      },
    },
  })

  if (userRoles.some((ur) => ur.role.name === "super-admin")) {
    return [ALL_PERMISSIONS]
  }

  const set = new Set<string>()
  for (const ur of userRoles) {
    for (const p of ur.role.permissions) {
      set.add(p.permission)
    }
  }
  return Array.from(set)
}

/**
 * Ambil role user beserta nama tampilannya (untuk badge di sidebar/topbar).
 */
export async function getUserRoleBadges(userId: string): Promise<{ name: string; displayName: string }[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { select: { name: true, displayName: true } } },
  })
  return userRoles.map((ur) => ({ name: ur.role.name, displayName: ur.role.displayName }))
}

/**
 * Cek akses user ke sebuah menu admin (guard untuk server action).
 * Server action bisa dipanggil langsung tanpa melalui guard halaman
 * (layout/proxy), jadi setiap aksi sensitif wajib memakai guard ini.
 */
export async function canAccessAdminMenu(userId: string, pathname: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return hasMenuAccess(permissions, pathname)
}

/**
 * Cek apakah user boleh mengelola role (membuat/mengubah akses/menghapus role).
 */
export async function canManageRoles(userId: string): Promise<boolean> {
  return canAccessAdminMenu(userId, "/admin/roles")
}

/**
 * Cek apakah user boleh mengelola pengguna (membuat/mengubah role user, dll).
 */
export async function canManageUsers(userId: string): Promise<boolean> {
  return canAccessAdminMenu(userId, "/admin/users")
}

/**
 * Validasi kunci permission: hanya kunci menu yang dikenal yang boleh disimpan.
 * Menolak "*" dan kunci asing (mencegah penanaman akses penuh via request manual).
 */
export function isValidPermissionKey(key: string): boolean {
  return key !== ALL_PERMISSIONS && VALID_MENU_KEYS.has(key)
}
