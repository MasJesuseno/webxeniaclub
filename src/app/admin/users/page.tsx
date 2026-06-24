import { prisma } from "@/lib/prisma"
import { UserManager } from "./user-manager"

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      roles: { include: { role: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const roles = await prisma.role.findMany()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengguna</h1>
      <UserManager users={users} roles={roles} />
    </div>
  )
}
