import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryManager } from "./category-manager";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return <CategoryManager categories={categories} />;
}
