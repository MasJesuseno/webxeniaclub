import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlumniManager } from "./alumni-manager";

export default async function AlumniPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const alumni = await prisma.alumni.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <AlumniManager items={alumni} />;
}
