// Seed role default + akses menu (idempotent).
// Dipakai untuk mensinkronkan role default (Super Admin, Editor, Member, Bendahara)
// beserta permission menu-nya ke database — aman dijalankan berulang kali
// dan tidak menyentuh data lain.
//
// ⚠️ PERHATIAN: script ini akan MENIMPA (reset) akses menu role default apa pun
// yang sudah dikustomisasi. Jangan jalankan di production setelah role diatur manual.
//
// Jalankan: npx tsx scripts/seed-roles.ts
import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const roleDefaults: {
  name: string
  displayName: string
  isSystem: boolean
  permissions: string[]
}[] = [
  {
    name: "super-admin",
    displayName: "Super Admin",
    isSystem: true,
    permissions: ["*"], // akses semua menu
  },
  {
    name: "editor",
    displayName: "Editor",
    isSystem: true,
    permissions: [
      "dashboard",
      "posts",
      "categories",
      "pages",
      "menus",
      "albums",
      "gallery",
      "testimonials",
      "comments",
    ],
  },
  {
    name: "member",
    displayName: "Member",
    isSystem: false,
    permissions: ["dashboard", "regions"],
  },
  {
    name: "bendahara",
    displayName: "Bendahara",
    isSystem: false,
    permissions: [
      "dashboard",
      "financial-reports",
      "registration-periods",
      "registration-data",
      "buku-member",
      "regions",
      "sos",
      "barang",
      "barang-masuk-keluar",
    ],
  },
]

async function main() {
  console.log("Seeding roles & permissions...")

  for (const cfg of roleDefaults) {
    const role = await prisma.role.upsert({
      where: { name: cfg.name },
      update: {},
      create: {
        name: cfg.name,
        displayName: cfg.displayName,
        isSystem: cfg.isSystem,
      },
    })

    // Sinkronkan akses menu (hapus lalu buat ulang — idempotent)
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } })
    if (cfg.permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: cfg.permissions.map((permission) => ({ roleId: role.id, permission })),
      })
    }

    console.log(`  ✓ ${cfg.displayName} (${cfg.name}) — ${cfg.permissions.length} permission`)
  }

  console.log("Done.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
