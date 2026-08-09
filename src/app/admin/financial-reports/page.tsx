import { prisma } from "@/lib/prisma"
import { ReportManager } from "./report-manager"

export default async function AdminFinancialReportsPage() {
  const reports = await prisma.financialReport.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Laporan Keuangan</h1>
      <p className="text-sm text-gray-500 mb-6">
        Kelola laporan keuangan bulanan yang ditampilkan di halaman publik.
      </p>
      <ReportManager reports={reports} />
    </div>
  )
}
