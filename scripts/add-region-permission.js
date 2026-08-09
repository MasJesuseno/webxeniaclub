// Tambahkan permission "regions" ke role bendahara & member secara idempotent.
// Aman untuk produksi: TIDAK menghapus/mereset permission lain (berbeda dari seed-roles.ts).
// Jalankan: node scripts/add-region-permission.js
require("dotenv/config")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  const roles = await prisma.role.findMany({
    where: { name: { in: ["bendahara", "member"] } },
    select: { id: true, name: true },
  })
  let added = 0
  for (const role of roles) {
    const existing = await prisma.rolePermission.findUnique({
      where: { roleId_permission: { roleId: role.id, permission: "regions" } },
    })
    if (existing) {
      console.log(`  ✓ ${role.name}: sudah punya akses Region`)
      continue
    }
    await prisma.rolePermission.create({
      data: { roleId: role.id, permission: "regions" },
    })
    added++
    console.log(`  ✓ ${role.name}: akses Region ditambahkan`)
  }
  console.log(`Done. ${added} permission baru ditambahkan.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
