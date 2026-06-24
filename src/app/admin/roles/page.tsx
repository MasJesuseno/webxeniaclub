import { prisma } from "@/lib/prisma"
import { RoleManager } from "./role-manager"

export default async function AdminRolesPage() {
  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Role</h1>
      <RoleManager roles={roles} />
    </div>
  )
}
