"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"

// ==================== AUTH ====================

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username dan password harus diisi" }
  }

  return { success: true }
}

// ==================== POSTS ====================

export async function getPosts(params?: { status?: string; categoryId?: string; featured?: boolean; limit?: number }) {
  const where: any = {}
  if (params?.status) where.status = params.status
  if (params?.categoryId) where.categoryId = params.categoryId
  if (params?.featured !== undefined) where.featured = params.featured

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { name: true } },
      category: true,
    },
    orderBy: { publishedAt: "desc" },
    take: params?.limit,
  })

  return posts
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } },
      category: true,
      tags: { include: { tag: true } },
    },
  })
}

export async function createPost(_prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const excerpt = formData.get("excerpt") as string
  const image = formData.get("image") as string
  const status = formData.get("status") as string
  const featured = formData.get("featured") === "true"
  const categoryId = formData.get("categoryId") as string

  if (!title || !content) return { error: "Judul dan konten harus diisi" }

  let slug = slugify(title)
  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) slug += "-" + Date.now()

  await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      image: image || null,
      status: status || "draft",
      featured,
      publishedAt: status === "published" ? new Date() : null,
      authorId: session.user.id,
      categoryId: categoryId || null,
    },
  })

  revalidatePath("/admin/posts")
  revalidatePath("/")
  revalidatePath("/berita")
  return { success: true }
}

export async function updatePost(id: string, _prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const excerpt = formData.get("excerpt") as string
  const image = formData.get("image") as string
  const status = formData.get("status") as string
  const featured = formData.get("featured") === "true"
  const categoryId = formData.get("categoryId") as string

  if (!title || !content) return { error: "Judul dan konten harus diisi" }

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return { error: "Post not found" }

  let slug = slugify(title)
  if (slug !== post.slug) {
    const existing = await prisma.post.findUnique({ where: { slug } })
    if (existing) slug += "-" + Date.now()
  }

  const data: any = {
    title,
    slug,
    content,
    excerpt: excerpt || null,
    image: image || null,
    status,
    featured,
    categoryId: categoryId || null,
  }

  if (status === "published" && !post.publishedAt) {
    data.publishedAt = new Date()
  }

  await prisma.post.update({ where: { id }, data })

  revalidatePath("/admin/posts")
  revalidatePath("/admin/posts/" + id + "/edit")
  revalidatePath("/")
  revalidatePath("/berita")
  revalidatePath("/berita/" + post.slug)
  return { success: true }
}

export async function deletePost(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return { error: "Post not found" }

  await prisma.post.delete({ where: { id } })

  revalidatePath("/admin/posts")
  revalidatePath("/")
  revalidatePath("/berita")
  return { success: true }
}

// ==================== CATEGORIES ====================

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  })
}

export async function createCategory(_prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const color = formData.get("color") as string
  if (!name) return { error: "Nama kategori harus diisi" }

  let slug = slugify(name)
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) slug += "-" + Date.now()

  await prisma.category.create({
    data: { name, slug, color: color || "#DC2626" },
  })

  revalidatePath("/admin/categories")
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const color = formData.get("color") as string
  if (!name) return { error: "Nama kategori harus diisi" }

  let slug = slugify(name)
  const existing = await prisma.category.findFirst({ where: { slug, NOT: { id } } })
  if (existing) slug += "-" + Date.now()

  await prisma.category.update({
    where: { id },
    data: { name, slug, color: color || "#DC2626" },
  })

  revalidatePath("/admin/categories")
  return { success: true }
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } })
  revalidatePath("/admin/categories")
  return { success: true }
}

// ==================== PAGES ====================

export async function getPages() {
  return prisma.page.findMany({ orderBy: { createdAt: "desc" } })
}

export async function getPageBySlug(slug: string) {
  return prisma.page.findUnique({
    where: { slug, status: "published" },
  })
}

export async function createPage(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const layout = formData.get("layout") as string
  const status = formData.get("status") as string

  if (!title || !content) return { error: "Judul dan konten harus diisi" }

  let slug = slugify(title)
  const existing = await prisma.page.findUnique({ where: { slug } })
  if (existing) slug += "-" + Date.now()

  await prisma.page.create({
    data: {
      title,
      slug,
      content,
      layout: layout || "default",
      status: status || "draft",
    },
  })

  revalidatePath("/admin/pages")
  return { success: true }
}

export async function updatePage(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const layout = formData.get("layout") as string
  const status = formData.get("status") as string

  if (!title || !content) return { error: "Judul dan konten harus diisi" }

  const page = await prisma.page.findUnique({ where: { id } })
  if (!page) return { error: "Page not found" }

  let slug = slugify(title)
  if (slug !== page.slug) {
    const existing = await prisma.page.findFirst({ where: { slug, NOT: { id } } })
    if (existing) slug += "-" + Date.now()
  }

  await prisma.page.update({
    where: { id },
    data: { title, slug, content, layout, status },
  })

  revalidatePath("/admin/pages")
  return { success: true }
}

export async function deletePage(id: string) {
  await prisma.page.delete({ where: { id } })
  revalidatePath("/admin/pages")
  return { success: true }
}

// ==================== MENUS ====================

export async function getMenus() {
  return prisma.menu.findMany({
    include: {
      items: {
        include: {
          children: true,
          page: { select: { title: true, slug: true } },
        },
        orderBy: { order: "asc" },
        where: { parentId: null },
      },
    },
  })
}

export async function getMenuByLocation(location: string) {
  return prisma.menu.findUnique({
    where: { location },
    include: {
      items: {
        include: {
          children: {
            include: { page: { select: { title: true, slug: true } } },
            orderBy: { order: "asc" },
          },
          page: { select: { title: true, slug: true } },
        },
        orderBy: { order: "asc" },
        where: { parentId: null },
      },
    },
  })
}

export async function createMenu(formData: FormData) {
  const name = formData.get("name") as string
  const location = formData.get("location") as string
  if (!name || !location) return { error: "Nama dan lokasi harus diisi" }

  await prisma.menu.create({ data: { name, location } })
  revalidatePath("/admin/menus")
  return { success: true }
}

export async function createMenuItem(formData: FormData) {
  const label = formData.get("label") as string
  const url = formData.get("url") as string
  const pageId = formData.get("pageId") as string
  const parentId = formData.get("parentId") as string
  const menuId = formData.get("menuId") as string

  if (!label || !menuId) return { error: "Label dan menu harus diisi" }

  const count = await prisma.menuItem.count({ where: { menuId, parentId: parentId || null } })

  await prisma.menuItem.create({
    data: {
      label,
      url: url || null,
      pageId: pageId || null,
      parentId: parentId || null,
      menuId,
      order: count,
    },
  })

  revalidatePath("/admin/menus")
  return { success: true }
}

export async function deleteMenuItem(id: string) {
  await prisma.menuItem.delete({ where: { id } })
  revalidatePath("/admin/menus")
  return { success: true }
}

export async function deleteMenu(id: string) {
  await prisma.menu.delete({ where: { id } })
  revalidatePath("/admin/menus")
  return { success: true }
}

// ==================== ALBUMS ====================

export async function getAlbums() {
  return prisma.album.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  })
}

export async function getAlbumBySlug(slug: string) {
  return prisma.album.findUnique({
    where: { slug },
    include: { items: { orderBy: { createdAt: "desc" } } },
  })
}

export async function createAlbum(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const coverImage = formData.get("coverImage") as string

  if (!title) return { error: "Judul album harus diisi" }

  let slug = slugify(title)
  const existing = await prisma.album.findUnique({ where: { slug } })
  if (existing) slug += "-" + Date.now()

  await prisma.album.create({
    data: {
      title,
      slug,
      description: description || null,
      coverImage: coverImage || null,
    },
  })

  revalidatePath("/admin/albums")
  revalidatePath("/galeri")
  return { success: true }
}

export async function updateAlbum(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const coverImage = formData.get("coverImage") as string

  if (!title) return { error: "Judul album harus diisi" }

  const album = await prisma.album.findUnique({ where: { id } })
  if (!album) return { error: "Album not found" }

  let slug = slugify(title)
  if (slug !== album.slug) {
    const existing = await prisma.album.findFirst({ where: { slug, NOT: { id } } })
    if (existing) slug += "-" + Date.now()
  }

  await prisma.album.update({
    where: { id },
    data: { title, slug, description: description || null, coverImage: coverImage || null },
  })

  revalidatePath("/admin/albums")
  revalidatePath("/galeri")
  return { success: true }
}

export async function deleteAlbum(id: string) {
  await prisma.album.delete({ where: { id } })
  revalidatePath("/admin/albums")
  revalidatePath("/galeri")
  return { success: true }
}

// ==================== GALLERY ====================

export async function createGalleryItem(formData: FormData) {
  const title = formData.get("title") as string
  const image = formData.get("image") as string
  const description = formData.get("description") as string
  const albumId = formData.get("albumId") as string

  if (!image || !albumId) return { error: "Gambar dan album harus diisi" }

  await prisma.galleryItem.create({
    data: {
      title: title || null,
      image,
      description: description || null,
      albumId,
    },
  })

  revalidatePath("/admin/gallery")
  revalidatePath("/galeri")
  return { success: true }
}

export async function deleteGalleryItem(id: string) {
  await prisma.galleryItem.delete({ where: { id } })
  revalidatePath("/admin/gallery")
  revalidatePath("/galeri")
  return { success: true }
}

// ==================== TESTIMONIALS ====================

export async function getTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })
}

export async function getActiveTestimonials() {
  return prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })
}

export async function createTestimonial(formData: FormData) {
  const name = formData.get("name") as string
  const content = formData.get("content") as string
  const title = formData.get("title") as string
  const photo = formData.get("photo") as string
  const order = parseInt(formData.get("order") as string) || 0

  if (!name || !content) return { error: "Nama dan testimoni harus diisi" }

  await prisma.testimonial.create({
    data: { name, content, title: title || null, photo: photo || null, order },
  })

  revalidatePath("/admin/testimonials")
  revalidatePath("/")
  return { success: true }
}

export async function updateTestimonial(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const content = formData.get("content") as string
  const title = formData.get("title") as string
  const photo = formData.get("photo") as string
  const isActive = formData.get("isActive") === "true"
  const order = parseInt(formData.get("order") as string) || 0

  if (!name || !content) return { error: "Nama dan testimoni harus diisi" }

  await prisma.testimonial.update({
    where: { id },
    data: { name, content, title: title || null, photo: photo || null, isActive, order },
  })

  revalidatePath("/admin/testimonials")
  revalidatePath("/")
  return { success: true }
}

export async function deleteTestimonial(id: string) {
  await prisma.testimonial.delete({ where: { id } })
  revalidatePath("/admin/testimonials")
  revalidatePath("/")
  return { success: true }
}

// ==================== PARTNERS ====================

export async function getPartners() {
  return prisma.partner.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })
}

export async function getActivePartners() {
  return prisma.partner.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })
}

export async function createPartner(_prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const logo = formData.get("logo") as string
  const description = formData.get("description") as string
  const website = formData.get("website") as string
  const order = parseInt(formData.get("order") as string) || 0

  if (!name || !logo) return { error: "Nama dan logo mitra harus diisi" }

  await prisma.partner.create({
    data: { name, logo, description: description || null, website: website || null, order },
  })

  revalidatePath("/admin/partners")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function updatePartner(id: string, _prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const logo = formData.get("logo") as string
  const description = formData.get("description") as string
  const website = formData.get("website") as string
  const isActive = formData.get("isActive") === "true"
  const order = parseInt(formData.get("order") as string) || 0

  if (!name || !logo) return { error: "Nama dan logo mitra harus diisi" }

  await prisma.partner.update({
    where: { id },
    data: { name, logo, description: description || null, website: website || null, isActive, order },
  })

  revalidatePath("/admin/partners")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function deletePartner(id: string) {
  await prisma.partner.delete({ where: { id } })
  revalidatePath("/admin/partners")
  revalidatePath("/", "layout")
  return { success: true }
}

// ==================== CONTACTS ====================

export async function submitContact(_prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string
  const captchaToken = formData.get("captchaToken") as string
  const captchaAnswer = formData.get("captchaAnswer") as string

  if (!name || !email || !message) return { error: "Nama, email, dan pesan harus diisi" }

  // Validate captcha
  if (!captchaToken || !captchaAnswer) {
    return { error: "Harap isi verifikasi keamanan", captchaError: true }
  }

  const { validateCaptcha } = await import("@/lib/math-captcha")
  if (!validateCaptcha(captchaToken, captchaAnswer)) {
    return { error: "Jawaban captcha salah", captchaError: true }
  }

  await prisma.contact.create({
    data: { name, email, phone: phone || null, subject: subject || null, message },
  })

  return { success: true }
}

export async function getContacts() {
  return prisma.contact.findMany({ orderBy: { createdAt: "desc" } })
}

export async function markContactRead(id: string) {
  const contact = await prisma.contact.findUnique({ where: { id } })
  if (contact) {
    await prisma.contact.update({ where: { id }, data: { isRead: !contact.isRead } })
  }
  revalidatePath("/admin/contacts")
  return { success: true }
}

export async function deleteContact(id: string) {
  await prisma.contact.delete({ where: { id } })
  revalidatePath("/admin/contacts")
  return { success: true }
}

// ==================== SETTINGS ====================

export async function getSetting(key: string) {
  const setting = await prisma.setting.findUnique({ where: { key } })
  return setting?.value || null
}

export async function setSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  revalidatePath("/admin/settings")
}

export async function getSiteProfile() {
  let profile = await prisma.siteProfile.findFirst()
  if (!profile) {
    profile = await prisma.siteProfile.create({
      data: {
        clubName: "Xenia Club Indonesia",
        shortName: "DXIC",
        slogan: "Xenia Menyatukan Kita",
        description: "Komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia",
        primaryColor: "#DC2626",
      },
    })
  }
  return profile
}

export async function updateSiteProfile(formData: FormData) {
  const data: any = {}
  const fields = [
    "clubName", "shortName", "slogan", "description",
    "address", "phone", "email", "logo", "favicon",
    "vision", "mission", "about", "history", "homeBanner",
    "primaryColor", "instagramUrl", "youtubeUrl",
    "facebookUrl", "twitterUrl",
  ]

  for (const field of fields) {
    const val = formData.get(field)
    if (val !== null) data[field] = val
  }

  const memberCount = formData.get("memberCount")
  const cityCount = formData.get("cityCount")
  const establishedYear = formData.get("establishedYear")

  if (memberCount) data.memberCount = parseInt(memberCount as string)
  if (cityCount) data.cityCount = parseInt(cityCount as string)
  if (establishedYear) data.establishedYear = establishedYear

  const profile = await prisma.siteProfile.findFirst()
  if (profile) {
    await prisma.siteProfile.update({ where: { id: profile.id }, data })
  } else {
    await prisma.siteProfile.create({ data: data as any })
  }

  revalidatePath("/admin/settings")
  revalidatePath("/")
  return { success: true }
}

// ==================== USERS ====================

export async function getUsers() {
  return prisma.user.findMany({
    include: {
      roles: { include: { role: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !username || !email || !password) return { error: "Semua field harus diisi" }

  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) return { error: "Email sudah terdaftar" }

  const existingUsername = await prisma.user.findUnique({ where: { username } })
  if (existingUsername) return { error: "Username sudah terdaftar" }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashedPassword,
    },
  })

  revalidatePath("/admin/users")
  return { success: true }
}

export async function toggleUserActive(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return { error: "User not found" }

  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  })

  revalidatePath("/admin/users")
  return { success: true }
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } })
  revalidatePath("/admin/users")
  return { success: true }
}

// ==================== ROLES ====================

export async function getRoles() {
  return prisma.role.findMany({
    include: { _count: { select: { users: true } } },
  })
}

export async function createRole(formData: FormData) {
  const name = formData.get("name") as string
  const displayName = formData.get("displayName") as string

  if (!name || !displayName) return { error: "Nama role harus diisi" }

  await prisma.role.create({
    data: { name: slugify(name), displayName },
  })

  revalidatePath("/admin/roles")
  return { success: true }
}

export async function deleteRole(id: string) {
  const role = await prisma.role.findUnique({ where: { id } })
  if (role?.isSystem) return { error: "Role sistem tidak bisa dihapus" }

  await prisma.role.delete({ where: { id } })
  revalidatePath("/admin/roles")
  return { success: true }
}
