import { prisma } from "@/lib/prisma"
import { PartnerManager } from "./partner-manager"

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mitra Kerja Sama</h1>
      <p className="text-sm text-gray-500 mb-6">
        Kelola mitra kerja sama yang ditampilkan di halaman depan website.
      </p>
      <PartnerManager partners={partners} />
    </div>
  )
}
