"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export async function createAlbum(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const coverImage = formData.get("coverImage") as string;

  await prisma.album.create({
    data: { title, slug: slugify(title), description, coverImage },
  });

  revalidatePath("/admin/albums");
}

export async function updateAlbum(id: number, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const coverImage = formData.get("coverImage") as string;

  await prisma.album.update({
    where: { id },
    data: { title, slug: slugify(title), description, coverImage },
  });

  revalidatePath("/admin/albums");
}

export async function deleteAlbum(id: number) {
  await prisma.album.delete({ where: { id } });
  revalidatePath("/admin/albums");
}
