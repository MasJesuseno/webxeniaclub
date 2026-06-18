import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "../../post-form";
import { notFound } from "next/navigation";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const [post, categories, tags, users] = await Promise.all([
    prisma.post.findUnique({
      where: { id: Number(id) },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <PostForm
      categories={categories}
      tags={tags}
      users={users}
      post={post}
      currentUserId={Number((session.user as any).id)}
    />
  );
}
