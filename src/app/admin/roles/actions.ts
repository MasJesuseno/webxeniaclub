"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRole(formData: FormData) {
  const name = formData.get("name") as string;
  const displayName = formData.get("displayName") as string;
  const description = formData.get("description") as string;

  await prisma.role.create({
    data: { name, displayName, description },
  });

  revalidatePath("/admin/roles");
}

export async function updateRole(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const displayName = formData.get("displayName") as string;
  const description = formData.get("description") as string;

  await prisma.role.update({
    where: { id },
    data: { name, displayName, description },
  });

  revalidatePath("/admin/roles");
}

export async function deleteRole(id: number) {
  await prisma.role.delete({ where: { id } });
  revalidatePath("/admin/roles");
}
