import { prisma } from "@/lib/prisma"
import { RegionManager } from "./region-manager"

export default async function AdminRegionsPage() {
  const regions = await prisma.region.findMany({
    orderBy: [{ order: "asc" }, { region: "asc" }],
  })

  const memberRegions = await prisma.prospectiveMember.count({
    where: { region: { not: null } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Region</h1>
      <p className="text-sm text-gray-500 mb-6">
        Kelola data region, ketua region, dan kontak grup WA. Data region dapat
        disinkronkan otomatis dari region pada data member ({memberRegions} member
        memiliki region).
      </p>
      <RegionManager regions={regions} memberRegionCount={memberRegions} />
    </div>
  )
}
