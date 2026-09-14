import { prisma } from "@/lib/prisma"
import { RekapRegisterManager } from "./rekap-register-manager"

export default async function RekapRegisterPage() {
  const [registrationData, periods, members] = await Promise.all([
    prisma.registrationData.findMany({
      include: {
        registrationPeriod: { select: { id: true, period: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.registrationPeriod.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.prospectiveMember.findMany({
      where: { memberId: { not: null } },
      select: { memberId: true, region: true },
    }),
  ])

  // Build memberId -> region map
  const memberRegionMap = new Map<string, string | null>()
  for (const m of members) {
    if (m.memberId) {
      memberRegionMap.set(m.memberId, m.region || null)
    }
  }

  // Group by region + period
  type RekapRow = {
    region: string
    period: string
    periodId: string
    total: number
    belum: number
    lunas: number
    menunggu: number
  }

  const rekapMap = new Map<string, RekapRow>()

  for (const item of registrationData) {
    const memberId = item.memberId || ""
    const region = memberRegionMap.get(memberId) || "Tidak Ada Region"
    const period = item.registrationPeriod.period
    const periodId = item.registrationPeriodId
    const key = `${region}|||${periodId}`

    if (!rekapMap.has(key)) {
      rekapMap.set(key, {
        region,
        period,
        periodId,
        total: 0,
        belum: 0,
        lunas: 0,
        menunggu: 0,
      })
    }

    const row = rekapMap.get(key)!
    row.total++
    if (item.status === "Lunas") {
      row.lunas++
    } else if (item.status === "Menunggu Verifikasi") {
      row.menunggu++
    } else {
      row.belum++
    }
  }

  const rekapData = Array.from(rekapMap.values()).sort((a, b) => {
    const regionCmp = a.region.localeCompare(b.region, "id")
    if (regionCmp !== 0) return regionCmp
    return a.period.localeCompare(b.period, "id")
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Rekap Register</h1>
      <p className="text-sm text-gray-500 mb-6">
        Rekapitulasi data pendaftaran member berdasarkan region dan periode register.
      </p>
      <RekapRegisterManager
        rekapData={JSON.parse(JSON.stringify(rekapData))}
        periods={JSON.parse(JSON.stringify(periods))}
      />
    </div>
  )
}
