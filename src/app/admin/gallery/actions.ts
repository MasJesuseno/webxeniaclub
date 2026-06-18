"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addGalleryItem(formData: FormData) {
  const title = formData.get("title") as string;
  const image = formData.get("image") as string;
  const description = formData.get("description") as string;
  const albumId = formData.get("albumId")
    ? Number(formData.get("albumId"))
    : null;
  const type = formData.get("type") as string || "image";

  await prisma.galleryItem.create({
    data: { title: title || null, image, description: description || null, albumId, type },
  });

  revalidatePath("/admin/gallery");
}

export async function updateGalleryItem(id: number, formData: FormData) {
  const title = formData.get("title") as string;
  const image = formData.get("image") as string;
  const description = formData.get("description") as string;
  const albumId = formData.get("albumId")
    ? Number(formData.get("albumId"))
    : null;
  const type = formData.get("type") as string || "image";

  await prisma.galleryItem.update({
    where: { id },
    data: {
      title: title || null,
      image,
      description: description || null,
      albumId,
      type,
    },
  });

  revalidatePath("/admin/gallery");
}

export async function deleteGalleryItem(id: number) {
  await prisma.galleryItem.delete({ where: { id } });
  revalidatePath("/admin/gallery");
}
