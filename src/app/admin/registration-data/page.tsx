import { prisma } from "@/lib/prisma"
import { getSiteProfile } from "@/lib/actions"
import { RegistrationDataManager } from "./registration-data-manager"

export default async function AdminRegistrationDataPage() {
  const [data, periods, members, siteProfile] = await Promise.all([
    prisma.registrationData.findMany({
      include: {
        registrationPeriod: { select: { period: true, regisLang: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.registrationPeriod.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.prospectiveMember.findMany({
      where: { memberId: { not: null } },
      select: { id: true, memberId: true, namaLengkap: true, namaPanggilan: true, foto: true, masaBerlaku: true, region: true },
      orderBy: { namaLengkap: "asc" },
    }),
    getSiteProfile(),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Data Register</h1>
      <p className="text-sm text-gray-500 mb-6">
        Kelola data pendaftaran member per periode register, termasuk tagihan dan pembayaran.
      </p>
      <RegistrationDataManager
        data={JSON.parse(JSON.stringify(data))}
        periods={JSON.parse(JSON.stringify(periods))}
        members={JSON.parse(JSON.stringify(members))}
        siteProfile={JSON.parse(JSON.stringify(siteProfile))}
      />
    </div>
  )
}
