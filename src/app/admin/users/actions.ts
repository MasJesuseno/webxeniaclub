"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleIds = formData.getAll("roleIds").map(Number);

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      roles: {
        create: roleIds.map((roleId) => ({ roleId })),
      },
    },
  });

  revalidatePath("/admin/users");
}

export async function updateUser(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const isActive = formData.get("isActive") === "on";
  const roleIds = formData.getAll("roleIds").map(Number);

  const data: any = { name, email, isActive };
  if (password) {
    data.password = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({ where: { id }, data });

  // Update roles
  await prisma.userRole.deleteMany({ where: { userId: id } });
  await prisma.userRole.createMany({
    data: roleIds.map((roleId) => ({ userId: id, roleId })),
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(id: number) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}

export async function updateUserStatus(id: number, isActive: boolean) {
  await prisma.user.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/users");
}
