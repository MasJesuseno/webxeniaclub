import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoleManager } from "./role-manager";

export default async function RolesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const roles = await prisma.role.findMany({
    include: {
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <RoleManager roles={roles} />;
}
