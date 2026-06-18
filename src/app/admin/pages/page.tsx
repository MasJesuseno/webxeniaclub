import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageManager } from "./page-manager";

export default async function PagesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const pages = await prisma.page.findMany({
    orderBy: { order: "asc" },
  });

  return <PageManager pages={pages} />;
}
