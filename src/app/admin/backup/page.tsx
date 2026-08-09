import { getDbConfig } from "@/lib/db-backup"
import { BackupManager } from "./backup-manager"

export const dynamic = "force-dynamic"

export default async function AdminBackupPage() {
  let dbInfo = { host: "—", database: "—", user: "—" }
  try {
    const cfg = getDbConfig()
    dbInfo = { host: cfg.host, database: cfg.database, user: cfg.user }
  } catch {
    // Biarkan placeholder bila env tidak tersedia
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Backup & Restore Database</h1>
      <p className="text-sm text-gray-500 mb-6">
        Unduh salinan lengkap database (format SQL) atau pulihkan database dari file backup.
        Restore akan <span className="font-semibold text-red-600">menimpa seluruh data</span> saat ini.
      </p>
      <BackupManager dbInfo={dbInfo} />
    </div>
  )
}
