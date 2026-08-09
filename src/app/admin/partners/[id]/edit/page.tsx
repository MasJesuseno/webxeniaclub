import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditPartnerForm } from "./edit-form"

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const partner = await prisma.partner.findUnique({
    where: { id },
  })
  if (!partner) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a
          href="/admin/partners"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Mitra</h1>
          <p className="text-sm text-gray-500 mt-0.5">Mengedit: {partner.name}</p>
        </div>
      </div>
      <EditPartnerForm partner={partner} />
    </div>
  )
}
