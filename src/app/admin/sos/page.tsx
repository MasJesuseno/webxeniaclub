import { prisma } from "@/lib/prisma"
import { SosManager } from "./sos-manager"

export default async function AdminSosPage() {
  const messages = await prisma.sosMessage.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">SOS — Informasi Darurat</h1>
      <p className="text-sm text-gray-500 mb-6">
        Kelola data permintaan bantuan SOS dari member. Lihat lokasi GPS, kebutuhan, dan status penanganan.
      </p>
      <SosManager messages={messages} />
    </div>
  )
}
