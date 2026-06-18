"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { slugify } from "./utils";

// ─── User Actions ───────────────────────────────────────────
export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleIds = formData.getAll("roleIds").map(Number);

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
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
  return { success: true, data: user };
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

  const user = await prisma.user.update({
    where: { id },
    data,
  });

  // Update roles
  await prisma.userRole.deleteMany({ where: { userId: id } });
  await prisma.userRole.createMany({
    data: roleIds.map((roleId) => ({ userId: id, roleId })),
  });

  revalidatePath("/admin/users");
  return { success: true, data: user };
}

export async function deleteUser(id: number) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  return { success: true };
}

// ─── Role Actions ───────────────────────────────────────────
export async function createRole(formData: FormData) {
  const name = formData.get("name") as string;
  const displayName = formData.get("displayName") as string;
  const description = formData.get("description") as string;

  const role = await prisma.role.create({
    data: { name, displayName, description },
  });

  revalidatePath("/admin/roles");
  return { success: true, data: role };
}

export async function updateRole(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const displayName = formData.get("displayName") as string;
  const description = formData.get("description") as string;

  const role = await prisma.role.update({
    where: { id },
    data: { name, displayName, description },
  });

  revalidatePath("/admin/roles");
  return { success: true, data: role };
}

export async function deleteRole(id: number) {
  await prisma.role.delete({ where: { id } });
  revalidatePath("/admin/roles");
  return { success: true };
}

// ─── Post Actions ───────────────────────────────────────────
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

  // Ensure unique slug
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    slug = slug + "-" + Date.now();
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      image,
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
  return { success: true, data: post };
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
    content,
    excerpt,
    image,
    status,
    featured,
    categoryId,
  };

  if (status === "published") {
    data.publishedAt = new Date();
  }

  if (title) {
    data.slug = slugify(title);
    const existing = await prisma.post.findFirst({
      where: { slug: data.slug, id: { not: id } },
    });
    if (existing) {
      data.slug = data.slug + "-" + Date.now();
    }
  }

  await prisma.post.update({ where: { id }, data });

  // Update tags
  await prisma.postTag.deleteMany({ where: { postId: id } });
  await prisma.postTag.createMany({
    data: tagIds.map((tagId) => ({ postId: id, tagId })),
  });

  revalidatePath("/admin/posts");
  revalidatePath("/berita");
  return { success: true };
}

export async function deletePost(id: number) {
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
  revalidatePath("/berita");
  return { success: true };
}

// ─── Category Actions ──────────────────────────────────────
export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string;

  const category = await prisma.category.create({
    data: { name, slug: slugify(name), description, color },
  });

  revalidatePath("/admin/categories");
  return { success: true, data: category };
}

export async function updateCategory(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string;

  const category = await prisma.category.update({
    where: { id },
    data: { name, slug: slugify(name), description, color },
  });

  revalidatePath("/admin/categories");
  return { success: true, data: category };
}

export async function deleteCategory(id: number) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { success: true };
}

// ─── Tag Actions ────────────────────────────────────────────
export async function createTag(formData: FormData) {
  const name = formData.get("name") as string;
  const tag = await prisma.tag.create({
    data: { name, slug: slugify(name) },
  });
  revalidatePath("/admin/tags");
  return { success: true, data: tag };
}

export async function deleteTag(id: number) {
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/tags");
  return { success: true };
}

// ─── Page Actions ──────────────────────────────────────────
export async function createPage(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const status = formData.get("status") as string || "draft";
  const layout = formData.get("layout") as string || "default";
  const order = Number(formData.get("order")) || 0;

  const page = await prisma.page.create({
    data: {
      title,
      slug: slugify(title),
      content,
      status,
      layout,
      order,
    },
  });

  revalidatePath("/admin/pages");
  return { success: true, data: page };
}

export async function updatePage(id: number, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const status = formData.get("status") as string;
  const layout = formData.get("layout") as string;
  const order = Number(formData.get("order")) || 0;

  const data: any = { title, content, status, layout, order };
  data.slug = slugify(title);

  await prisma.page.update({ where: { id }, data });
  revalidatePath("/admin/pages");
  return { success: true };
}

export async function deletePage(id: number) {
  await prisma.page.delete({ where: { id } });
  revalidatePath("/admin/pages");
  return { success: true };
}

// ─── Menu Actions ──────────────────────────────────────────
export async function createMenu(formData: FormData) {
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;

  const menu = await prisma.menu.create({
    data: { name, location },
  });

  revalidatePath("/admin/menus");
  return { success: true, data: menu };
}

export async function deleteMenu(id: number) {
  await prisma.menu.delete({ where: { id } });
  revalidatePath("/admin/menus");
  return { success: true };
}

export async function addMenuItem(formData: FormData) {
  const label = formData.get("label") as string;
  const url = formData.get("url") as string;
  const pageId = formData.get("pageId")
    ? Number(formData.get("pageId"))
    : null;
  const menuId = Number(formData.get("menuId"));
  const parentId = formData.get("parentId")
    ? Number(formData.get("parentId"))
    : null;
  const order = Number(formData.get("order")) || 0;

  const item = await prisma.menuItem.create({
    data: { label, url, pageId, menuId, parentId, order },
  });

  revalidatePath("/admin/menus");
  return { success: true, data: item };
}

export async function updateMenuItem(id: number, formData: FormData) {
  const label = formData.get("label") as string;
  const url = formData.get("url") as string;
  const pageId = formData.get("pageId")
    ? Number(formData.get("pageId"))
    : null;
  const order = Number(formData.get("order")) || 0;
  const isActive = formData.get("isActive") === "on";

  await prisma.menuItem.update({
    where: { id },
    data: { label, url, pageId, order, isActive },
  });

  revalidatePath("/admin/menus");
  return { success: true };
}

export async function deleteMenuItem(id: number) {
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/admin/menus");
  return { success: true };
}

// ─── Album Actions ──────────────────────────────────────────
export async function createAlbum(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const coverImage = formData.get("coverImage") as string;

  const album = await prisma.album.create({
    data: { title, slug: slugify(title), description, coverImage },
  });

  revalidatePath("/admin/albums");
  return { success: true, data: album };
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
  return { success: true };
}

export async function deleteAlbum(id: number) {
  await prisma.album.delete({ where: { id } });
  revalidatePath("/admin/albums");
  return { success: true };
}

// ─── Gallery Actions ────────────────────────────────────────
export async function addGalleryItem(formData: FormData) {
  const title = formData.get("title") as string;
  const image = formData.get("image") as string;
  const description = formData.get("description") as string;
  const albumId = formData.get("albumId")
    ? Number(formData.get("albumId"))
    : null;
  const type = formData.get("type") as string || "image";
  const url = formData.get("url") as string;

  const item = await prisma.galleryItem.create({
    data: { title, image, description, albumId, type, url },
  });

  revalidatePath("/admin/gallery");
  return { success: true, data: item };
}

export async function deleteGalleryItem(id: number) {
  await prisma.galleryItem.delete({ where: { id } });
  revalidatePath("/admin/gallery");
  return { success: true };
}

// ─── Contact Actions ────────────────────────────────────────
export async function markContactRead(id: number) {
  await prisma.contact.update({
    where: { id },
    data: { isRead: true },
  });
  revalidatePath("/admin/contacts");
  return { success: true };
}

export async function deleteContact(id: number) {
  await prisma.contact.delete({ where: { id } });
  revalidatePath("/admin/contacts");
  return { success: true };
}

// ─── Settings Actions ──────────────────────────────────────
export async function updateProfile(formData: FormData) {
  const data: any = {};
  const fields = [
    "schoolName", "shortName", "slogan", "description",
    "address", "phone", "email", "website", "logo", "favicon",
    "vision", "mission", "about", "history",
    "youtubeUrl", "instagramUrl", "facebookUrl", "twitterUrl",
  ];

  for (const field of fields) {
    const value = formData.get(field);
    if (value) data[field] = value;
  }

  const profile = await prisma.siteProfile.upsert({
    where: { id: 1 },
    update: data,
    create: { ...data },
  });

  revalidatePath("/admin/settings");
  return { success: true, data: profile };
}

export async function updateSetting(formData: FormData) {
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  revalidatePath("/admin/settings");
  return { success: true, data: setting };
}
