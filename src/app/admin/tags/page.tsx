import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TagManager } from "./tag-manager";

export default async function TagsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return <TagManager tags={tags} />;
}
