import { prisma } from "@/lib/prisma"
import { RegistrationPeriodManager } from "./registration-period-manager"

export default async function AdminRegistrationPeriodsPage() {
  const periods = await prisma.registrationPeriod.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Periode Register</h1>
      <p className="text-sm text-gray-500 mb-6">
        Kelola periode pendaftaran member baru, termasuk biaya dan batas akhir pendaftaran.
      </p>
      <RegistrationPeriodManager periods={periods} />
    </div>
  )
}
