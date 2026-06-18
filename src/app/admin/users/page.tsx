import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserManager } from "./user-manager";

export default async function UsersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const users = await prisma.user.findMany({
    include: { roles: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
  });

  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
  });

  return <UserManager users={users} roles={roles} />;
}
