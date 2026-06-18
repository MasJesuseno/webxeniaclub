import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "../post-form";

export default async function CreatePostPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [categories, tags, users] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <PostForm
      categories={categories}
      tags={tags}
      users={users}
      currentUserId={Number((session.user as any).id)}
    />
  );
}
