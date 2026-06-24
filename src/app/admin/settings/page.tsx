import { getSiteProfile } from "@/lib/actions"
import { SettingsForm } from "./settings-form"

export default async function AdminSettingsPage() {
  const profile = await getSiteProfile()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan</h1>
      <SettingsForm profile={JSON.parse(JSON.stringify(profile))} />
    </div>
  )
}
