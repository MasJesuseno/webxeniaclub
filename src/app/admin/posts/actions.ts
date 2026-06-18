"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const image = formData.get("image") as string;
  const status = formData.get("status") as string;
  const featured = formData.get("featured") === "on";
  const categoryId = formData.get("categoryId")
    ? Number(formData.get("categoryId"))
    : null;
  const authorId = Number(formData.get("authorId"));
  const tagIds = formData.getAll("tagIds").map(Number);

  let slug = slugify(title);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    slug = slug + "-" + Date.now();
  }

  await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      image: image || null,
      status,
      featured,
      categoryId,
      authorId,
      publishedAt: status === "published" ? new Date() : null,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/berita");
}

export async function updatePost(id: number, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const image = formData.get("image") as string;
  const status = formData.get("status") as string;
  const featured = formData.get("featured") === "on";
  const categoryId = formData.get("categoryId")
    ? Number(formData.get("categoryId"))
    : null;
  const tagIds = formData.getAll("tagIds").map(Number);

  const data: any = {
    title,
    slug: slugify(title),
    content,
    excerpt,
    image: image || null,
    status,
    featured,
    categoryId,
  };

  if (status === "published") {
    data.publishedAt = new Date();
  }

  // Check slug uniqueness
  const existing = await prisma.post.findFirst({
    where: { slug: data.slug, id: { not: id } },
  });
  if (existing) {
    data.slug = data.slug + "-" + Date.now();
  }

  await prisma.post.update({ where: { id }, data });

  // Update tags
  await prisma.postTag.deleteMany({ where: { postId: id } });
  if (tagIds.length > 0) {
    await prisma.postTag.createMany({
      data: tagIds.map((tagId) => ({ postId: id, tagId })),
    });
  }

  revalidatePath("/admin/posts");
  revalidatePath("/berita");
}

export async function deletePost(id: number) {
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
  revalidatePath("/berita");
}
