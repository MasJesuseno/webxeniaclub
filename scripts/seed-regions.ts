// Seed data Region dari region pada data member (ProspectiveMember.region).
// Idempotent — region yang sudah ada dilewati, provinsi dilengkapi bila kosong.
//
// Jalankan: npx tsx scripts/seed-regions.ts
import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Menyinkronkan Region dari data member...")

  const members = await prisma.prospectiveMember.findMany({
    where: { region: { not: null } },
    select: { region: true, provinsi: true },
  })

  // Kumpulkan semua region unik dari member (abaikan yang kosong/placeholder)
  const PLACEHOLDER = new Set(["", "-", "kosong", "n/a", "none", "tidak ada"])
  const regionSet = new Set<string>()
  for (const m of members) {
    const r = (m.region || "").trim()
    if (r && !PLACEHOLDER.has(r.toLowerCase())) regionSet.add(r)
  }

  // Kelompokkan provinsi per region, ambil yang paling umum
  const provinceCount: Record<string, Record<string, number>> = {}
  for (const m of members) {
    const r = (m.region || "").trim()
    const p = (m.provinsi || "").trim()
    if (!r || !p) continue
    if (!provinceCount[r]) provinceCount[r] = {}
    provinceCount[r][p] = (provinceCount[r][p] || 0) + 1
  }

  const regionProvince: Record<string, string | null> = {}
  for (const [r, counts] of Object.entries(provinceCount)) {
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    if (best) regionProvince[r] = best[0]
  }

  let created = 0
  let updated = 0
  let skipped = 0

  for (const r of Array.from(regionSet).sort()) {
    const existing = await prisma.region.findUnique({ where: { region: r } })
    if (existing) {
      if (!existing.provinsi && regionProvince[r]) {
        await prisma.region.update({ where: { id: existing.id }, data: { provinsi: regionProvince[r] } })
        updated++
      } else {
        skipped++
      }
      continue
    }
    await prisma.region.create({
      data: {
        region: r,
        provinsi: regionProvince[r] || null,
        ketuaRegion: null,
        emailKetua: null,
        waKetua: null,
        linkWaGrup: null,
        order: 0,
      },
    })
    created++
  }

  console.log(`  ✓ ${created} region baru dibuat`)
  console.log(`  ✓ ${updated} region provinsi dilengkapi`)
  console.log(`  ✓ ${skipped} region sudah ada`)
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
