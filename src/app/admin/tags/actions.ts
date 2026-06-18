"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export async function createTag(formData: FormData) {
  const name = formData.get("name") as string;
  await prisma.tag.create({
    data: { name, slug: slugify(name) },
  });
  revalidatePath("/admin/tags");
}

export async function deleteTag(id: number) {
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/tags");
}
