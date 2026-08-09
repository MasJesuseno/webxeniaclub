import { getProspectiveMembers, getSiteProfile } from "@/lib/actions"
import { MemberManager } from "./member-manager"

export default async function ProspectiveMembersPage() {
  const [members, profile] = await Promise.all([
    getProspectiveMembers(),
    getSiteProfile(),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Data Member</h1>
        <p className="text-gray-500 mt-1">Kelola data anggota DXIC, export/import data member via Excel</p>
      </div>
      <MemberManager
        members={JSON.parse(JSON.stringify(members))}
        siteProfile={JSON.parse(JSON.stringify(profile))}
      />
    </div>
  )
}
