"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { slugify, escapeHtml, formatDateSafe } from "@/lib/utils"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import { getMemberSession } from "@/lib/member-auth"
import { canManageRoles, canManageUsers, canAccessAdminMenu, isValidPermissionKey, getUserPermissions } from "@/lib/permissions"
import { ALL_PERMISSIONS } from "@/lib/admin-menu"
import { saveEmailSettings, createSmtpTransport, getEmailSettings, sendEmail } from "@/lib/email"
import { buildBarangTransaksiWhere } from "@/lib/barang-filter"

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

async function generatePartnerId(): Promise<string> {
  // Find the highest existing partnerId number
  const lastPartner = await prisma.partner.findFirst({
    where: { partnerId: { startsWith: "DXIC-BEN-" } },
    orderBy: { partnerId: "desc" },
  })

  let nextNumber = 1
  if (lastPartner?.partnerId) {
    const match = lastPartner.partnerId.match(/DXIC-BEN-(\d+)/)
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }

  return `DXIC-BEN-${String(nextNumber).padStart(3, "0")}`
}

export async function createPartner(_prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const logo = formData.get("logo") as string
  const description = formData.get("description") as string
  const website = formData.get("website") as string
  const locationLink = formData.get("locationLink") as string
  const benefit = formData.get("benefit") as string
  const region = formData.get("region") as string
  const order = parseInt(formData.get("order") as string) || 0

  if (!name || !logo) return { error: "Nama dan logo mitra harus diisi" }

  const partnerId = await generatePartnerId()

  await prisma.partner.create({
    data: {
      partnerId,
      name,
      logo,
      description: description || null,
      website: website || null,
      locationLink: locationLink || null,
      benefit: benefit || null,
      region: region || null,
      order,
    },
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
  const locationLink = formData.get("locationLink") as string
  const benefit = formData.get("benefit") as string
  const region = formData.get("region") as string
  const isActive = formData.get("isActive") === "true"
  const order = parseInt(formData.get("order") as string) || 0

  if (!name) return { error: "Nama mitra harus diisi" }

  // Jika logo kosong saat update, ambil logo yang sudah ada
  const existing = await prisma.partner.findUnique({ where: { id } })
  if (!existing) return { error: "Mitra tidak ditemukan" }

  await prisma.partner.update({
    where: { id },
    data: {
      name,
      logo: logo || existing.logo,
      description: description || null,
      website: website || null,
      locationLink: locationLink || null,
      benefit: benefit || null,
      region: region || null,
      isActive,
      order,
    },
  })

  revalidatePath("/admin/partners")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function togglePartnerActive(id: string) {
  const partner = await prisma.partner.findUnique({ where: { id } })
  if (!partner) return { error: "Partner not found" }

  await prisma.partner.update({
    where: { id },
    data: { isActive: !partner.isActive },
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

// ==================== COMMENTS ====================

export async function submitComment(_prevState: any, formData: FormData) {
  const postId = formData.get("postId") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const content = formData.get("content") as string
  const captchaToken = formData.get("captchaToken") as string
  const captchaAnswer = formData.get("captchaAnswer") as string

  if (!postId || !name || !email || !content) {
    return { error: "Semua field harus diisi" }
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: "Format email tidak valid" }
  }

  // Validate captcha
  if (!captchaToken || !captchaAnswer) {
    return { error: "Harap isi verifikasi keamanan", captchaError: true }
  }

  const { validateCaptcha } = await import("@/lib/math-captcha")
  if (!validateCaptcha(captchaToken, captchaAnswer)) {
    return { error: "Jawaban captcha salah", captchaError: true }
  }

  // Check post exists
  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) return { error: "Post tidak ditemukan" }

  await prisma.comment.create({
    data: { postId, name, email, content },
  })

  revalidatePath("/berita/" + post.slug)
  return { success: true }
}

export async function approveComment(commentId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { post: true } })
  if (!comment) return { error: "Comment not found" }

  await prisma.comment.update({
    where: { id: commentId },
    data: { isApproved: !comment.isApproved },
  })

  revalidatePath("/admin/comments")
  revalidatePath("/berita/" + comment.post.slug)
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { post: true } })
  if (!comment) return { error: "Comment not found" }

  await prisma.comment.delete({ where: { id: commentId } })

  revalidatePath("/admin/comments")
  revalidatePath("/berita/" + comment.post.slug)
  return { success: true }
}

export async function getCommentsByPost(postId: string) {
  return prisma.comment.findMany({
    where: { postId, isApproved: true },
    orderBy: { createdAt: "asc" },
  })
}

// ==================== PROSPECTIVE MEMBERS ====================

export async function submitMemberRegistration(_prevState: any, formData: FormData) {
  try {
    const namaLengkap = formData.get("namaLengkap") as string
    const namaPanggilan = formData.get("namaPanggilan") as string
    const jenisKelamin = formData.get("jenisKelamin") as string
    const tempatLahir = formData.get("tempatLahir") as string
    const tanggalLahir = formData.get("tanggalLahir") as string
    const alamatLengkap = formData.get("alamatLengkap") as string
    const kotaKabupaten = formData.get("kotaKabupaten") as string
    const provinsi = formData.get("provinsi") as string
    const noWa = formData.get("noWa") as string
    const golonganDarah = formData.get("golonganDarah") as string
    const jenisMobil = formData.get("jenisMobil") as string
    const tipeMobil = formData.get("tipeMobil") as string
    const tahunProduksi = formData.get("tahunProduksi") as string
    const warna = formData.get("warna") as string
    const noPolisi = formData.get("noPolisi") as string
    const email = formData.get("email") as string
    const alasanBergabung = formData.get("alasanBergabung") as string
    const ukuranKaos = formData.get("ukuranKaos") as string
    const foto = formData.get("foto") as string
    const fotoSim = formData.get("fotoSim") as string
    const fotoMobilDepan = formData.get("fotoMobilDepan") as string
    const fotoMobilSamping = formData.get("fotoMobilSamping") as string
    const fotoBuktiTransfer = formData.get("fotoBuktiTransfer") as string
    const captchaToken = formData.get("captchaToken") as string
    const captchaAnswer = formData.get("captchaAnswer") as string

    // Validasi required fields
    if (!namaLengkap || !email || !noWa || !jenisMobil || !tipeMobil || !tahunProduksi || !noPolisi) {
      return { error: "Field wajib harus diisi (Nama, Email, No WA, Jenis Mobil, Tipe, Tahun, No Polisi)" }
    }

    // Validate captcha
    if (!captchaToken || !captchaAnswer) {
      return { error: "Harap isi verifikasi keamanan", captchaError: true }
    }

    const { validateCaptcha } = await import("@/lib/math-captcha")
    if (!validateCaptcha(captchaToken, captchaAnswer)) {
      return { error: "Jawaban captcha salah", captchaError: true }
    }

    // Check duplicate email
    const existingEmail = await prisma.prospectiveMember.findFirst({ where: { email } })
    if (existingEmail) {
      return { error: "Email sudah terdaftar" }
    }

    await prisma.prospectiveMember.create({
      data: {
        namaLengkap,
        namaPanggilan: namaPanggilan || null,
        jenisKelamin: jenisKelamin || null,
        tempatLahir: tempatLahir || null,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : new Date(),
        alamatLengkap: alamatLengkap || null,
        kotaKabupaten: kotaKabupaten || null,
        provinsi: provinsi || null,
        noWa,
        golonganDarah: golonganDarah || null,
        jenisMobil,
        tipeMobil,
        tahunProduksi: parseInt(tahunProduksi) || 0,
        warna: warna || null,
        noPolisi,
        email,
        alasanBergabung: alasanBergabung || null,
        ukuranKaos: ukuranKaos || null,
        foto: foto || null,
        fotoSim: fotoSim || null,
        fotoMobilDepan: fotoMobilDepan || null,
        fotoMobilSamping: fotoMobilSamping || null,
        fotoBuktiTransfer: fotoBuktiTransfer || null,
      },
    })

    // ── Notifikasi email ke admin ber-role Member ──
    // Gagal kirim email TIDAK membuat pendaftaran gagal — cukup dicatat di log.
    try {
      const memberRoleUsers = await prisma.user.findMany({
        where: {
          isActive: true,
          notifyEmail: true,
          roles: { some: { role: { name: "member" } } },
        },
        select: { id: true, email: true, name: true },
      })

      if (memberRoleUsers.length > 0) {
        const baseUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "")
        const adminUrl = baseUrl ? `${baseUrl}/admin/prospective-members` : "/admin/prospective-members"
        const buktiUrl = fotoBuktiTransfer ? (baseUrl ? `${baseUrl}${fotoBuktiTransfer}` : fotoBuktiTransfer) : ""

        const esc = escapeHtml
        const tglLahirLabel = formatDateSafe(tanggalLahir)
        const lokasi = [kotaKabupaten, provinsi].filter(Boolean).join(", ") || "—"

        const subject = `Calon Member Baru — ${namaLengkap}`
        const text = [
          `Halo, ada calon member baru yang mendaftar:`,
          `• Nama Lengkap: ${namaLengkap}`,
          namaPanggilan ? `• Nama Panggilan: ${namaPanggilan}` : "",
          `• Email: ${email}`,
          `• No. WA: ${noWa}`,
          jenisKelamin ? `• Jenis Kelamin: ${jenisKelamin}` : "",
          `• Lokasi: ${lokasi}`,
          `• Jenis Mobil: ${jenisMobil} ${tipeMobil}`,
          tahunProduksi ? `• Tahun Produksi: ${tahunProduksi}` : "",
          warna ? `• Warna: ${warna}` : "",
          `• No. Polisi: ${noPolisi}`,
          alasanBergabung ? `• Alasan Bergabung: ${alasanBergabung}` : "",
          fotoBuktiTransfer ? `• Bukti Transfer: ${fotoBuktiTransfer}` : "",
          "",
          `Kelola di panel admin: ${adminUrl}`,
        ].filter(Boolean).join("\n")

        const html = `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
            <div style="background:#DC2626;padding:20px 24px">
              <h2 style="margin:0;color:#fff;font-size:18px">🆕 Calon Member Baru</h2>
            </div>
            <div style="padding:24px">
              <p style="margin:0 0 16px;color:#374151;font-size:14px">
                Ada calon member baru yang mengisi formulir pendaftaran. Berikut datanya:
              </p>
              <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151">
                <tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600;width:40%">Nama Lengkap</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(namaLengkap)}</td>
                </tr>
                ${namaPanggilan ? `<tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Nama Panggilan</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(namaPanggilan)}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Email</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(email)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">No. WA</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(noWa)}</td>
                </tr>
                ${jenisKelamin ? `<tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Jenis Kelamin</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(jenisKelamin)}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Lokasi</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(lokasi)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Jenis Mobil</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(jenisMobil)} ${esc(tipeMobil)}</td>
                </tr>
                ${tahunProduksi ? `<tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Tahun Produksi</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(tahunProduksi)}</td>
                </tr>` : ""}
                ${warna ? `<tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Warna</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(warna)}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">No. Polisi</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(noPolisi)}</td>
                </tr>
                ${tanggalLahir ? `<tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Tanggal Lahir</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(tglLahirLabel)}</td>
                </tr>` : ""}
                ${alasanBergabung ? `<tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Alasan Bergabung</td>
                  <td style="padding:8px 12px;border:1px solid #eee">${esc(alasanBergabung)}</td>
                </tr>` : ""}
                ${fotoBuktiTransfer ? `<tr>
                  <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Bukti Transfer</td>
                  <td style="padding:8px 12px;border:1px solid #eee"><a href="${esc(buktiUrl)}" style="color:#DC2626;font-weight:600">Lihat bukti transfer</a></td>
                </tr>` : ""}
              </table>
              <div style="margin-top:20px">
                <a href="${adminUrl}" style="display:inline-block;background:#DC2626;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600">Lihat di Panel Admin</a>
              </div>
            </div>
          </div>
        `.trim()

        for (const user of memberRoleUsers) {
          if (!user.email) continue
          const result = await sendEmail({ to: user.email, subject, text, html })
          if (!result.success) {
            console.warn(`Notifikasi email calon member (${user.email}) gagal: ${result.message}`)
          }
        }
      }
    } catch (err) {
      console.error("Notifikasi email calon member error:", err)
    }

    revalidatePath("/admin/prospective-members")
    return { success: true }
  } catch (error) {
    console.error("submitMemberRegistration error:", error)
    return { error: "Gagal menyimpan data. Silakan coba lagi." }
  }
}

export async function getProspectiveMembers() {
  return prisma.prospectiveMember.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function updateProspectiveMember(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const memberId = formData.get("memberId") as string
  const status = formData.get("status") as string
  const adminNote = formData.get("adminNote") as string
  const region = formData.get("region") as string
  const namaLengkap = formData.get("namaLengkap") as string
  const namaPanggilan = formData.get("namaPanggilan") as string
  const jenisKelamin = formData.get("jenisKelamin") as string
  const tempatLahir = formData.get("tempatLahir") as string
  const tanggalLahir = formData.get("tanggalLahir") as string
  const alamatLengkap = formData.get("alamatLengkap") as string
  const kotaKabupaten = formData.get("kotaKabupaten") as string
  const provinsi = formData.get("provinsi") as string
  const noWa = formData.get("noWa") as string
  const golonganDarah = formData.get("golonganDarah") as string
  const jenisMobil = formData.get("jenisMobil") as string
  const tipeMobil = formData.get("tipeMobil") as string
  const tahunProduksi = formData.get("tahunProduksi") as string
  const warna = formData.get("warna") as string
  const noPolisi = formData.get("noPolisi") as string
  const email = formData.get("email") as string
  const alasanBergabung = formData.get("alasanBergabung") as string
  const ukuranKaos = formData.get("ukuranKaos") as string
  const foto = formData.get("foto") as string
  const fotoSim = formData.get("fotoSim") as string
  const fotoMobilDepan = formData.get("fotoMobilDepan") as string
  const fotoMobilSamping = formData.get("fotoMobilSamping") as string
  const fotoBuktiTransfer = formData.get("fotoBuktiTransfer") as string
  const statusMember = formData.get("statusMember") as string
  const masaBerlaku = formData.get("masaBerlaku") as string
  const password = formData.get("password") as string

  if (!namaLengkap) {
    return { error: "Nama lengkap harus diisi" }
  }

  const data: any = {
    namaLengkap,
    namaPanggilan: namaPanggilan || null,
    jenisKelamin: jenisKelamin || null,
    tempatLahir: tempatLahir || null,
    tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : undefined,
    alamatLengkap: alamatLengkap || null,
    kotaKabupaten: kotaKabupaten || null,
    provinsi: provinsi || null,
    noWa,
    golonganDarah: golonganDarah || null,
    jenisMobil: jenisMobil || undefined,
    tipeMobil: tipeMobil || undefined,
    tahunProduksi: parseInt(tahunProduksi) || undefined,
    warna: warna || null,
    noPolisi: noPolisi || undefined,
    email,
    alasanBergabung: alasanBergabung || null,
    ukuranKaos: ukuranKaos || null,
    foto: foto || null,
    fotoSim: fotoSim || null,
    fotoMobilDepan: fotoMobilDepan || null,
    fotoMobilSamping: fotoMobilSamping || null,
    fotoBuktiTransfer: fotoBuktiTransfer || null,
    memberId: memberId || null,
    region: region || null,
    status: status || "Diajukan",
    statusMember: statusMember || null,
    masaBerlaku: masaBerlaku ? new Date(masaBerlaku) : null,
    adminNote: adminNote || null,
  }

  // Hash password if provided (non-empty)
  if (password && password.trim().length > 0) {
    data.password = await bcrypt.hash(password.trim(), 12)
  }

  await prisma.prospectiveMember.update({ where: { id }, data })

  revalidatePath("/admin/prospective-members")
  return { success: true }
}

export async function getProspectiveMemberById(id: string) {
  return prisma.prospectiveMember.findUnique({ where: { id } })
}

export async function deleteProspectiveMember(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.prospectiveMember.delete({ where: { id } })
  revalidatePath("/admin/prospective-members")
  return { success: true }
}

// ==================== EXPORT / IMPORT MEMBERS ====================

export async function exportMembers() {
  const members = await prisma.prospectiveMember.findMany({
    orderBy: { createdAt: "desc" },
  })
  return members
}

export async function importMembersData(data: any[]) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    let imported = 0
    let updated = 0
    let skipped = 0
    const errors: string[] = []

    // Helper: convert Excel value to string safely (handles numbers from Excel serial dates etc.)
    const toStr = (v: any) => (v != null ? String(v) : null)

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNum = i + 2 // +2 karena header baris 1, data mulai baris 2
      const identitas = row.namaLengkap || row.email || `Baris ${rowNum}`

      // Validasi field wajib (hanya ID dan Nama yang required)
      const missingFields: string[] = []
      if (!row.id) missingFields.push("ID")
      if (!row.namaLengkap) missingFields.push("Nama")

      if (missingFields.length > 0) {
        skipped++
        errors.push(`Baris ${rowNum} (${identitas}): Data dilewati — field wajib kosong: ${missingFields.join(", ")}`)
        continue
      }    try {
      // Cek apakah memberId sudah ada — update jika ada, insert jika baru
      const existing = await prisma.prospectiveMember.findFirst({
        where: { memberId: toStr(row.id) },
      })

      const data = {
        namaLengkap: toStr(row.namaLengkap) || "",
        namaPanggilan: toStr(row.namaPanggilan),
        jenisKelamin: toStr(row.jenisKelamin),
        tempatLahir: toStr(row.tempatLahir),
        tanggalLahir: row.tanggalLahir ? new Date(row.tanggalLahir) : null,
        alamatLengkap: toStr(row.alamatLengkap),
        kotaKabupaten: toStr(row.kotaKabupaten),
        provinsi: toStr(row.provinsi),
        noWa: toStr(row.noWa) || "",
        golonganDarah: toStr(row.golonganDarah),
        jenisMobil: toStr(row.jenisMobil) || "Xenia",
        tipeMobil: toStr(row.tipeMobil) || "",
        tahunProduksi: parseInt(row.tahunProduksi) || null,
        warna: toStr(row.warna),
        noPolisi: toStr(row.noPolisi) || "",
        email: toStr(row.email) || "",
        alasanBergabung: toStr(row.alasanBergabung),
        ukuranKaos: toStr(row.ukuranKaos),
        region: toStr(row.region),
        memberId: toStr(row.id),
        status: toStr(row.status) || "Diajukan",
        statusMember: toStr(row.statusMember),
        masaBerlaku: row.masaBerlaku ? new Date(row.masaBerlaku) : null,
      }

      if (existing) {
        await prisma.prospectiveMember.update({
          where: { id: existing.id },
          data,
        })
        updated++
      } else {
        await prisma.prospectiveMember.create({ data })
        imported++
      }
    } catch (createError) {
      skipped++
      const errMsg = createError instanceof Error ? createError.message : String(createError)
      errors.push(`Baris ${rowNum} (${identitas}): Gagal menyimpan — ${errMsg}`)
    }
    }

    revalidatePath("/admin/prospective-members")
    return { success: true, imported, updated, skipped, errors }
  } catch (error) {
    console.error("importMembersData error:", error)
    const errMsg = error instanceof Error ? error.message : String(error)
    return { error: `Gagal mengimpor data: ${errMsg}` }
  }
}

// ==================== FINANCIAL REPORTS ====================

export async function getFinancialReports() {
  return prisma.financialReport.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function getActiveFinancialReports() {
  return prisma.financialReport.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createFinancialReport(_prevState: any, formData: FormData) {
  const period = formData.get("period") as string
  const description = formData.get("description") as string
  const file = formData.get("file") as string

  if (!period || !file) return { error: "Periode dan file harus diisi" }

  await prisma.financialReport.create({
    data: {
      period,
      description: description || null,
      file,
    },
  })

  revalidatePath("/admin/financial-reports")
  revalidatePath("/profil/laporan-keuangan")
  return { success: true }
}

export async function updateFinancialReport(id: string, _prevState: any, formData: FormData) {
  const period = formData.get("period") as string
  const description = formData.get("description") as string
  const file = formData.get("file") as string
  const isActive = formData.get("isActive") === "true"

  if (!period) return { error: "Periode harus diisi" }

  const existing = await prisma.financialReport.findUnique({ where: { id } })
  if (!existing) return { error: "Laporan tidak ditemukan" }

  await prisma.financialReport.update({
    where: { id },
    data: {
      period,
      description: description || null,
      file: file || existing.file,
      isActive,
    },
  })

  revalidatePath("/admin/financial-reports")
  revalidatePath("/admin/financial-reports/" + id + "/edit")
  revalidatePath("/profil/laporan-keuangan")
  return { success: true }
}

export async function toggleFinancialReportActive(id: string) {
  const report = await prisma.financialReport.findUnique({ where: { id } })
  if (!report) return { error: "Laporan tidak ditemukan" }

  await prisma.financialReport.update({
    where: { id },
    data: { isActive: !report.isActive },
  })

  revalidatePath("/admin/financial-reports")
  revalidatePath("/profil/laporan-keuangan")
  return { success: true }
}

export async function deleteFinancialReport(id: string) {
  await prisma.financialReport.delete({ where: { id } })
  revalidatePath("/admin/financial-reports")
  revalidatePath("/profil/laporan-keuangan")
  return { success: true }
}

// ==================== REGISTRATION PERIODS ====================

export async function getRegistrationPeriods() {
  return prisma.registrationPeriod.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function createRegistrationPeriod(_prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const period = formData.get("period") as string
  const biaya = formData.get("biaya") as string
  const tanggalBerlaku = formData.get("tanggalBerlaku") as string
  const batasAkhir = formData.get("batasAkhir") as string
  const status = formData.get("status") as string
  const regisLang = formData.get("regisLang") as string

  if (!period) return { error: "Periode register harus diisi" }

  await prisma.registrationPeriod.create({
    data: {
      period,
      biaya: biaya ? parseFloat(biaya) : null,
      tanggalBerlaku: tanggalBerlaku ? new Date(tanggalBerlaku) : null,
      batasAkhir: batasAkhir ? new Date(batasAkhir) : null,
      status: status || "Belum",
      regisLang: regisLang || "Tidak",
    },
  })

  revalidatePath("/admin/registration-periods")
  return { success: true }
}

export async function updateRegistrationPeriod(id: string, _prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const period = formData.get("period") as string
  const biaya = formData.get("biaya") as string
  const tanggalBerlaku = formData.get("tanggalBerlaku") as string
  const batasAkhir = formData.get("batasAkhir") as string
  const status = formData.get("status") as string
  const regisLang = formData.get("regisLang") as string

  if (!period) return { error: "Periode register harus diisi" }

  const existing = await prisma.registrationPeriod.findUnique({ where: { id } })
  if (!existing) return { error: "Periode tidak ditemukan" }

  await prisma.registrationPeriod.update({
    where: { id },
    data: {
      period,
      biaya: biaya ? parseFloat(biaya) : null,
      tanggalBerlaku: tanggalBerlaku ? new Date(tanggalBerlaku) : null,
      batasAkhir: batasAkhir ? new Date(batasAkhir) : null,
      status: status || "Belum",
      regisLang: regisLang || "Tidak",
    },
  })

  revalidatePath("/admin/registration-periods")
  revalidatePath("/admin/registration-periods/" + id + "/edit")
  return { success: true }
}

export async function deleteRegistrationPeriod(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.registrationPeriod.delete({ where: { id } })
  revalidatePath("/admin/registration-periods")
  return { success: true }
}

// ==================== REGISTRATION DATA ====================

export async function getRegistrationData() {
  return prisma.registrationData.findMany({
    include: {
      registrationPeriod: { select: { period: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createRegistrationData(_prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const registrationPeriodId = formData.get("registrationPeriodId") as string
  const biaya = formData.get("biaya") as string
  const memberId = formData.get("memberId") as string
  const namaMember = formData.get("namaMember") as string
  const tanggalTagihan = formData.get("tanggalTagihan") as string
  const tanggalBayar = formData.get("tanggalBayar") as string
  const fotoBukti = formData.get("fotoBukti") as string
  const status = formData.get("status") as string

  if (!registrationPeriodId || !namaMember) {
    return { error: "Periode register dan nama member harus diisi" }
  }

  await prisma.registrationData.create({
    data: {
      registrationPeriodId,
      biaya: biaya ? parseFloat(biaya) : null,
      memberId: memberId || null,
      namaMember,
      tanggalTagihan: tanggalTagihan ? new Date(tanggalTagihan) : null,
      tanggalBayar: tanggalBayar ? new Date(tanggalBayar) : null,
      fotoBukti: fotoBukti || null,
      status: status || "Belum",
    },
  })

  revalidatePath("/admin/registration-data")
  return { success: true }
}

export async function updateRegistrationData(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const registrationPeriodId = formData.get("registrationPeriodId") as string
  const biaya = formData.get("biaya") as string
  const memberId = formData.get("memberId") as string
  const namaMember = formData.get("namaMember") as string
  const tanggalTagihan = formData.get("tanggalTagihan") as string
  const tanggalBayar = formData.get("tanggalBayar") as string
  const fotoBukti = formData.get("fotoBukti") as string
  const status = formData.get("status") as string

  if (!registrationPeriodId || !namaMember) {
    return { error: "Periode register dan nama member harus diisi" }
  }

  const existing = await prisma.registrationData.findUnique({ where: { id } })
  if (!existing) return { error: "Data register tidak ditemukan" }

  await prisma.registrationData.update({
    where: { id },
    data: {
      registrationPeriodId,
      biaya: biaya ? parseFloat(biaya) : null,
      memberId: memberId || null,
      namaMember,
      tanggalTagihan: tanggalTagihan ? new Date(tanggalTagihan) : null,
      tanggalBayar: tanggalBayar ? new Date(tanggalBayar) : null,
      fotoBukti: fotoBukti || null,
      status: status || "Belum",
    },
  })

  // Jika regisLang = Ya dan status Lunas → edit Data Member: isi Masa Berlaku
  // dengan Tanggal Berlaku dari Periode Register yang dipilih.
  const finalStatus = status || "Belum"
  if (finalStatus === "Lunas") {
    try {
      const period = await prisma.registrationPeriod.findUnique({
        where: { id: registrationPeriodId },
        select: { regisLang: true, tanggalBerlaku: true },
      })
      if (period?.regisLang === "Ya" && period.tanggalBerlaku && memberId) {
        const result = await prisma.prospectiveMember.updateMany({
          // Cocokkan via memberId (mis. "1795") ATAU id internal (cuid) bila member belum punya memberId
          where: { OR: [{ memberId }, { id: memberId }] },
          data: { masaBerlaku: period.tanggalBerlaku },
        })
        if (result.count === 0) {
          console.warn(`updateRegistrationData: member dengan memberId \"${memberId}\" tidak ditemukan — masa berlaku tidak disinkronkan`)
        }
      }
    } catch (err) {
      // Gagal sinkron Masa Berlaku tidak boleh menggagalkan penyimpanan data register
      console.error("updateRegistrationData: gagal sinkron masa berlaku member:", err)
    }
  }

  revalidatePath("/admin/registration-data")
  revalidatePath("/p")
  if (memberId) revalidatePath("/p/" + memberId)
  revalidatePath("/admin/prospective-members")
  return { success: true }
}

export async function deleteRegistrationData(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.registrationData.delete({ where: { id } })
  revalidatePath("/admin/registration-data")
  return { success: true }
}

export async function bulkCreateTagihan(registrationPeriodId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  // Verify period exists
  const period = await prisma.registrationPeriod.findUnique({
    where: { id: registrationPeriodId },
  })
  if (!period) return { error: "Periode tidak ditemukan" }

  // Get all members with memberId (all registered members)
  const members = await prisma.prospectiveMember.findMany({
    where: {
      memberId: { not: null },
    },
  })

  // Get existing registration data for this period to avoid duplicates
  const existingData = await prisma.registrationData.findMany({
    where: { registrationPeriodId },
    select: { memberId: true },
  })
  const existingMemberIds = new Set(existingData.map((d) => d.memberId).filter(Boolean))

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (const member of members) {
    if (!member.memberId) continue

    // Skip if already has registration data for this period
    if (existingMemberIds.has(member.memberId)) {
      skipped++
      continue
    }

    try {
      await prisma.registrationData.create({
        data: {
          registrationPeriodId,
          biaya: period.biaya,
          memberId: member.memberId,
          namaMember: member.namaLengkap,
          tanggalTagihan: new Date("2026-08-31"),
          status: "Belum",
        },
      })
      created++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${member.memberId}: ${msg}`)
    }
  }

  revalidatePath("/admin/registration-data")
  return { success: true, created, skipped, errors }
}

export async function updateAllTanggalTagihan() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const result = await prisma.registrationData.updateMany({
      data: { tanggalTagihan: new Date("2026-08-31") },
    })

    revalidatePath("/admin/registration-data")
    return { success: true, count: result.count }
  } catch (error) {
    console.error("updateAllTanggalTagihan error:", error)
    return { error: "Gagal mengupdate tanggal tagihan" }
  }
}

// ==================== BUKU MEMBER ====================

export async function lookupMember(memberId: string) {
  if (!memberId || memberId.trim().length === 0) return null

  const member = await prisma.prospectiveMember.findFirst({
    where: { memberId: memberId.trim() },
    select: {
      namaLengkap: true,
      region: true,
    },
  })

  if (!member) return null
  return {
    namaMember: member.namaLengkap,
    region: member.region,
  }
}

export async function getMitraList() {
  return prisma.partner.findMany({
    where: { isActive: true },
    select: { name: true },
    orderBy: { order: "asc" },
  })
}

export async function getBukuMembers() {
  return prisma.bukuMember.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function getBukuMemberById(id: string) {
  return prisma.bukuMember.findUnique({ where: { id } })
}

export async function createBukuMember(_prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const memberId = formData.get("memberId") as string
  const namaMember = formData.get("namaMember") as string
  const region = formData.get("region") as string
  const mitra = formData.get("mitra") as string
  const tanggal = formData.get("tanggal") as string
  const jumlahBayar = formData.get("jumlahBayar") as string
  const diskon = formData.get("diskon") as string
  const keterangan = formData.get("keterangan") as string

  if (!namaMember || !mitra) return { error: "Nama member dan mitra harus diisi" }

  await prisma.bukuMember.create({
    data: {
      memberId: memberId || null,
      namaMember,
      region: region || null,
      mitra,
      tanggal: tanggal ? new Date(tanggal) : null,
      jumlahBayar: jumlahBayar ? parseFloat(jumlahBayar) : null,
      diskon: diskon || null,
      keterangan: keterangan || null,
    },
  })

  revalidatePath("/admin/buku-member")
  return { success: true }
}

export async function updateBukuMember(id: string, _prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const memberId = formData.get("memberId") as string
  const namaMember = formData.get("namaMember") as string
  const region = formData.get("region") as string
  const mitra = formData.get("mitra") as string
  const tanggal = formData.get("tanggal") as string
  const jumlahBayar = formData.get("jumlahBayar") as string
  const diskon = formData.get("diskon") as string
  const keterangan = formData.get("keterangan") as string

  if (!namaMember || !mitra) return { error: "Nama member dan mitra harus diisi" }

  const existing = await prisma.bukuMember.findUnique({ where: { id } })
  if (!existing) return { error: "Data buku member tidak ditemukan" }

  await prisma.bukuMember.update({
    where: { id },
    data: {
      memberId: memberId || null,
      namaMember,
      region: region || null,
      mitra,
      tanggal: tanggal ? new Date(tanggal) : null,
      jumlahBayar: jumlahBayar ? parseFloat(jumlahBayar) : null,
      diskon: diskon || null,
      keterangan: keterangan || null,
    },
  })

  revalidatePath("/admin/buku-member")
  revalidatePath("/admin/buku-member/" + id + "/edit")
  return { success: true }
}

export async function deleteBukuMember(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.bukuMember.delete({ where: { id } })
  revalidatePath("/admin/buku-member")
  return { success: true }
}

export async function getTransaksiSaya() {
  const member = await getMemberSession()
  if (!member || !member.memberId) return []

  const transaksi = await prisma.bukuMember.findMany({
    where: { memberId: member.memberId },
    orderBy: { createdAt: "desc" },
  })

  return transaksi
}

export async function submitTransaksiMember(_prevState: any, formData: FormData) {
  const member = await getMemberSession()
  if (!member) return { error: "Silakan login terlebih dahulu" }

  const mitra = formData.get("mitra") as string
  const tanggal = formData.get("tanggal") as string
  const jumlahBayar = formData.get("jumlahBayar") as string
  const diskon = formData.get("diskon") as string
  const keterangan = formData.get("keterangan") as string

  if (!mitra) return { error: "Mitra harus diisi" }

  await prisma.bukuMember.create({
    data: {
      memberId: member.memberId || null,
      namaMember: member.namaLengkap,
      region: member.region || null,
      mitra,
      tanggal: tanggal ? new Date(tanggal) : new Date(),
      jumlahBayar: jumlahBayar ? parseFloat(jumlahBayar) : null,
      diskon: diskon || null,
      keterangan: keterangan || null,
    },
  })

  revalidatePath("/member/benefit")
  return { success: true }
}

// ==================== REGION ====================

export async function createRegion(_prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/regions"))) {
    return { error: "Anda tidak memiliki izin untuk mengelola Region" }
  }

  const region = (formData.get("region") as string || "").trim()
  if (!region) return { error: "Nama region harus diisi" }

  const existing = await prisma.region.findUnique({ where: { region } })
  if (existing) return { error: `Region "${region}" sudah ada` }

  await prisma.region.create({
    data: {
      region,
      provinsi: (formData.get("provinsi") as string || "").trim() || null,
      ketuaRegion: (formData.get("ketuaRegion") as string || "").trim() || null,
      emailKetua: (formData.get("emailKetua") as string || "").trim() || null,
      waKetua: (formData.get("waKetua") as string || "").trim() || null,
      linkWaGrup: (formData.get("linkWaGrup") as string || "").trim() || null,
      order: parseInt(formData.get("order") as string) || 0,
    },
  })

  revalidatePath("/admin/regions")
  return { success: true }
}

export async function updateRegion(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/regions"))) {
    return { error: "Anda tidak memiliki izin untuk mengelola Region" }
  }

  const region = (formData.get("region") as string || "").trim()
  if (!region) return { error: "Nama region harus diisi" }

  const existing = await prisma.region.findUnique({ where: { id } })
  if (!existing) return { error: "Region tidak ditemukan" }

  const dup = await prisma.region.findFirst({ where: { region, NOT: { id } } })
  if (dup) return { error: `Region "${region}" sudah ada` }

  await prisma.region.update({
    where: { id },
    data: {
      region,
      provinsi: (formData.get("provinsi") as string || "").trim() || null,
      ketuaRegion: (formData.get("ketuaRegion") as string || "").trim() || null,
      emailKetua: (formData.get("emailKetua") as string || "").trim() || null,
      waKetua: (formData.get("waKetua") as string || "").trim() || null,
      linkWaGrup: (formData.get("linkWaGrup") as string || "").trim() || null,
      order: parseInt(formData.get("order") as string) || 0,
    },
  })

  revalidatePath("/admin/regions")
  return { success: true }
}

export async function deleteRegion(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/regions"))) {
    return { error: "Anda tidak memiliki izin untuk menghapus Region" }
  }

  await prisma.region.delete({ where: { id } })
  revalidatePath("/admin/regions")
  return { success: true }
}

/**
 * Sinkronkan data Region dari region member (ProspectiveMember.region).
 * Region baru yang belum ada dibuat otomatis; Provinsi diisi dari provinsi
 * yang paling umum di region tersebut; kolom lainnya (ketua, kontak, link WA)
 * dibiarkan kosong untuk diisi manual.
 */
export async function syncRegionsFromMembers() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/regions"))) {
    return { error: "Anda tidak memiliki izin untuk sinkronisasi Region" }
  }

  try {
    // Ambil semua region member beserta provinsinya
    const members = await prisma.prospectiveMember.findMany({
      where: { region: { not: null } },
      select: { region: true, provinsi: true },
    })

    // Kumpulkan semua region unik dari member (abaikan yang kosong/placeholder)
    const PLACEHOLDER = new Set(["", "-", "kosong", "n/a", "none", "tidak ada"])
    const regionSet = new Set<string>()
    for (const m of members) {
      const r = (m.region || "").trim()
      if (r && !PLACEHOLDER.has(r.toLowerCase())) regionSet.add(r)
    }

    // Kelompokkan provinsi per region, hitung yang paling umum
    const regionProvince: Record<string, string | null> = {}
    const provinceCount: Record<string, Record<string, number>> = {}

    for (const m of members) {
      const r = (m.region || "").trim()
      if (!r) continue
      const p = (m.provinsi || "").trim()
      if (!p) continue
      if (!provinceCount[r]) provinceCount[r] = {}
      provinceCount[r][p] = (provinceCount[r][p] || 0) + 1
    }

    for (const [r, counts] of Object.entries(provinceCount)) {
      const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
      if (best) regionProvince[r] = best[0]
    }

    let created = 0
    let skipped = 0

    for (const r of Array.from(regionSet).sort()) {
      const existing = await prisma.region.findUnique({ where: { region: r } })
      if (existing) {
        // Lengkapi provinsi jika masih kosong
        if (!existing.provinsi && regionProvince[r]) {
          await prisma.region.update({
            where: { id: existing.id },
            data: { provinsi: regionProvince[r] },
          })
        }
        skipped++
        continue
      }
      await prisma.region.create({
        data: {
          region: r,
          provinsi: regionProvince[r] || null,
          ketuaRegion: null,
          emailKetua: null,
          waKetua: null,
          linkWaGrup: null,
          order: 0,
        },
      })
      created++
    }

    revalidatePath("/admin/regions")
    return { success: true, created, skipped }
  } catch (error) {
    console.error("syncRegionsFromMembers error:", error)
    return { error: "Gagal sinkronisasi region" }
  }
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
    "cardTemplateFront", "cardTemplateBack",
    "bankName", "bankAccount", "bankAccountName",
    "organizationStructure",
    "jingleMp3",
    "momenSong",
    "momenSong2",
    "momenSongCaption",
    "momenSongCaption2",
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
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canManageUsers(session.user.id))) {
    return { error: "Anda tidak memiliki izin untuk mengelola pengguna" }
  }

  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const roleIds = formData.getAll("roleIds") as string[]
  const notifyEmail = formData.get("notifyEmail") === "true"

  // Hanya Super Admin yang boleh memberikan role Super Admin
  if (roleIds.length > 0) {
    const assignedRoles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { name: true },
    })
    if (assignedRoles.some((r) => r.name === "super-admin")) {
      const callerPermissions = await getUserPermissions(session.user.id)
      if (!callerPermissions.includes(ALL_PERMISSIONS)) {
        return { error: "Hanya Super Admin yang bisa memberikan role Super Admin" }
      }
    }
  }

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
      notifyEmail,
      roles: roleIds.length > 0
        ? { create: roleIds.map((roleId) => ({ roleId })) }
        : undefined,
    },
  })

  revalidatePath("/admin/users")
  return { success: true }
}

export async function updateUser(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canManageUsers(session.user.id))) {
    return { error: "Anda tidak memiliki izin untuk mengelola pengguna" }
  }

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const roleIds = formData.getAll("roleIds") as string[]
  const notifyEmail = formData.get("notifyEmail") === "true"

  // Hanya Super Admin yang boleh memberikan role Super Admin
  if (roleIds.length > 0) {
    const assignedRoles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { name: true },
    })
    if (assignedRoles.some((r) => r.name === "super-admin")) {
      const callerPermissions = await getUserPermissions(session.user.id)
      if (!callerPermissions.includes(ALL_PERMISSIONS)) {
        return { error: "Hanya Super Admin yang bisa memberikan role Super Admin" }
      }
    }
  }

  if (!id || !name || !username || !email) return { error: "Semua field harus diisi" }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return { error: "User tidak ditemukan" }

  const existingEmail = await prisma.user.findFirst({ where: { email, NOT: { id } } })
  if (existingEmail) return { error: "Email sudah digunakan" }

  const existingUsername = await prisma.user.findFirst({ where: { username, NOT: { id } } })
  if (existingUsername) return { error: "Username sudah digunakan" }

  const data: any = { name, username, email, notifyEmail }

  if (password) {
    data.password = await bcrypt.hash(password, 12)
  }

  // Update roles: delete all existing, then create new
  await prisma.userRole.deleteMany({ where: { userId: id } })
  if (roleIds.length > 0) {
    await prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId: id, roleId })),
    })
  }

  await prisma.user.update({ where: { id }, data })

  revalidatePath("/admin/users")
  return { success: true }
}

export async function toggleUserActive(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canManageUsers(session.user.id))) {
    return { error: "Anda tidak memiliki izin untuk mengelola pengguna" }
  }

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
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canManageUsers(session.user.id))) {
    return { error: "Anda tidak memiliki izin untuk mengelola pengguna" }
  }

  await prisma.user.delete({ where: { id } })
  revalidatePath("/admin/users")
  return { success: true }
}

// ==================== ROLES ====================

export async function getRoles() {
  return prisma.role.findMany({
    include: {
      _count: { select: { users: true } },
      permissions: { select: { permission: true } },
    },
  })
}

export async function createRole(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  // Hanya user dengan akses mengelola role yang boleh membuat role
  if (!(await canManageRoles(session.user.id))) {
    return { error: "Anda tidak memiliki izin untuk mengelola role" }
  }

  const name = formData.get("name") as string
  const displayName = formData.get("displayName") as string
  const permissions = (formData.getAll("permissions") as string[]).filter(isValidPermissionKey)

  if (!name || !displayName) return { error: "Nama role harus diisi" }

  await prisma.role.create({
    data: {
      name: slugify(name),
      displayName,
      permissions:
        permissions.length > 0
          ? { create: permissions.map((permission) => ({ permission })) }
          : undefined,
    },
  })

  revalidatePath("/admin/roles")
  return { success: true }
}

export async function updateRolePermissions(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  // Hanya user dengan akses mengelola role yang boleh mengubah akses role
  if (!(await canManageRoles(session.user.id))) {
    return { error: "Anda tidak memiliki izin untuk mengelola role" }
  }

  const roleId = formData.get("roleId") as string
  const permissions = (formData.getAll("permissions") as string[]).filter(isValidPermissionKey)

  if (!roleId) return { error: "Role harus dipilih" }

  const role = await prisma.role.findUnique({ where: { id: roleId } })
  if (!role) return { error: "Role tidak ditemukan" }
  if (role.name === "super-admin") return { error: "Akses menu Super Admin tidak bisa diubah" }

  await prisma.rolePermission.deleteMany({ where: { roleId } })
  if (permissions.length > 0) {
    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({ roleId, permission })),
    })
  }

  revalidatePath("/admin/roles")
  revalidatePath("/admin/users")
  return { success: true }
}

export async function deleteRole(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  // Hanya user dengan akses mengelola role yang boleh menghapus role
  if (!(await canManageRoles(session.user.id))) {
    return { error: "Anda tidak memiliki izin untuk mengelola role" }
  }

  const role = await prisma.role.findUnique({ where: { id } })
  if (role?.isSystem) return { error: "Role sistem tidak bisa dihapus" }

  await prisma.role.delete({ where: { id } })
  revalidatePath("/admin/roles")
  return { success: true }
}

// ==================== EMAIL SETTINGS (SMTP) ====================

export async function saveEmailSettingsAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/settings/email"))) {
    return { error: "Anda tidak memiliki izin untuk mengubah pengaturan email" }
  }

  const host = (formData.get("smtp_host") as string) || ""
  const port = parseInt((formData.get("smtp_port") as string) || "587", 10)
  const secure = (formData.get("smtp_secure") as string) === "true"
  const user = (formData.get("smtp_user") as string) || ""
  // Password dikosongkan di form = tidak diubah (tetap memakai yang tersimpan)
  const password = (formData.get("smtp_password") as string) || ""
  const fromEmail = (formData.get("smtp_from_email") as string) || ""
  const fromName = (formData.get("smtp_from_name") as string) || ""

  await saveEmailSettings({ host, port, secure, user, password, fromEmail, fromName })

  revalidatePath("/admin/settings/email")
  return { success: true, message: "Pengaturan email berhasil disimpan" }
}

export async function testEmailSmtpAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/settings/email"))) {
    return { error: "Anda tidak memiliki izin untuk menguji email" }
  }

  const recipient = (formData.get("recipient") as string) || ""
  if (!recipient) return { error: "Alamat email penerima uji harus diisi" }

  // Uji dengan nilai form saat ini (belum perlu disimpan dulu)
  const settings = {
    host: (formData.get("smtp_host") as string) || "",
    port: parseInt((formData.get("smtp_port") as string) || "587", 10),
    secure: (formData.get("smtp_secure") as string) === "true",
    user: (formData.get("smtp_user") as string) || "",
    password: (formData.get("smtp_password") as string) || "",
    fromEmail: (formData.get("smtp_from_email") as string) || "",
    fromName: (formData.get("smtp_from_name") as string) || "",
  }

  // Keamanan: email uji hanya boleh dikirim ke alamat sendiri — yaitu email admin
  // yang sedang login ATAU alamat email pengirim SMTP (mis. info@xeniaclub.or.id).
  // Ini mencegah aksi test dipakai sebagai relay/spam ke alamat sembarang.
  const allowed = [
    session.user.email || "",
    settings.fromEmail,
  ].map((e) => e.trim().toLowerCase()).filter(Boolean)
  if (allowed.length === 0 || !allowed.includes(recipient.trim().toLowerCase())) {
    return { error: `Email uji hanya bisa dikirim ke alamat sendiri: ${allowed.join(", ") || "(belum ada)"}` }
  }

  if (!settings.host) return { error: "SMTP Host belum diisi" }
  if (!settings.fromEmail) return { error: "Email pengirim (From) belum diisi" }

  // Jika password dikosongkan di form, pakai yang tersimpan di database
  if (!settings.password) {
    const saved = await getEmailSettings()
    settings.password = saved.password
  }

  const transporter = createSmtpTransport(settings)

  try {
    await transporter.sendMail({
      from: settings.fromName ? `"${settings.fromName}" <${settings.fromEmail}>` : settings.fromEmail,
      to: recipient,
      subject: "Email Uji — DXIC Xeniaclub",
      text: "Ini adalah email uji dari pengaturan SMTP DXIC Xeniaclub. Jika Anda menerima email ini, konfigurasi SMTP berfungsi dengan baik.",
      html: "<h2>📧 Email Uji Berhasil!</h2><p>Ini adalah email uji dari pengaturan SMTP <strong>DXIC Xeniaclub</strong>.</p><p>Jika Anda menerima email ini, konfigurasi SMTP berfungsi dengan baik.</p>",
    })
    return { success: true, message: `✅ Email uji berhasil terkirim ke ${recipient}` }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { error: `Koneksi SMTP gagal: ${msg}` }
  }
}

// ==================== BARANG (PROPERTI) ====================

export async function getBarangs() {
  return prisma.barang.findMany({
    orderBy: { nama: "asc" },
    include: { _count: { select: { transaksis: true } } },
  })
}

export async function createBarang(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/barang"))) {
    return { error: "Anda tidak memiliki izin untuk mengelola Master Barang" }
  }

  const nama = (formData.get("nama") as string || "").trim()
  const hargaBeliRaw = parseFloat(formData.get("hargaBeli") as string)
  const hargaJualRaw = parseFloat(formData.get("hargaJual") as string)
  const stok = parseInt(formData.get("stok") as string) || 0
  const lokasi = (formData.get("lokasi") as string || "").trim()

  if (!nama) return { error: "Nama barang harus diisi" }
  if (stok < 0) return { error: "Stok awal tidak boleh negatif" }

  await prisma.barang.create({
    data: {
      nama,
      hargaBeli: Number.isFinite(hargaBeliRaw) && hargaBeliRaw > 0 ? hargaBeliRaw : null,
      hargaJual: Number.isFinite(hargaJualRaw) && hargaJualRaw > 0 ? hargaJualRaw : null,
      stok,
      lokasi: lokasi || null,
    },
  })

  revalidatePath("/admin/barang")
  revalidatePath("/admin/barang-masuk-keluar")
  return { success: true }
}

export async function updateBarang(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/barang"))) {
    return { error: "Anda tidak memiliki izin untuk mengelola Master Barang" }
  }

  const nama = (formData.get("nama") as string || "").trim()
  const hargaBeliRaw = parseFloat(formData.get("hargaBeli") as string)
  const hargaJualRaw = parseFloat(formData.get("hargaJual") as string)
  const lokasi = (formData.get("lokasi") as string || "").trim()

  if (!nama) return { error: "Nama barang harus diisi" }

  const existing = await prisma.barang.findUnique({ where: { id } })
  if (!existing) return { error: "Barang tidak ditemukan" }

  // Stok tidak diedit di sini — stok hanya berubah lewat transaksi Masuk/Keluar.
  await prisma.barang.update({
    where: { id },
    data: {
      nama,
      hargaBeli: Number.isFinite(hargaBeliRaw) && hargaBeliRaw > 0 ? hargaBeliRaw : null,
      hargaJual: Number.isFinite(hargaJualRaw) && hargaJualRaw > 0 ? hargaJualRaw : null,
      lokasi: lokasi || null,
    },
  })

  revalidatePath("/admin/barang")
  revalidatePath("/admin/barang-masuk-keluar")
  return { success: true }
}

export async function deleteBarang(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/barang"))) {
    return { error: "Anda tidak memiliki izin untuk menghapus Barang" }
  }

  const existing = await prisma.barang.findUnique({ where: { id } })
  if (!existing) return { error: "Barang tidak ditemukan" }

  // Riwayat transaksi ikut terhapus (relasi cascade).
  await prisma.barang.delete({ where: { id } })

  revalidatePath("/admin/barang")
  revalidatePath("/admin/barang-masuk-keluar")
  return { success: true }
}

// ==================== BARANG MASUK / KELUAR ====================

export async function getBarangTransaksis() {
  return prisma.barangTransaksi.findMany({
    include: { barang: { select: { nama: true } } },
    orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
  })
}

/** Efek transaksi terhadap stok: "Masuk" menambah, "Keluar" mengurangi. */
function stokEffect(jenis: string, jumlah: number): number {
  return jenis === "Masuk" ? jumlah : -jumlah
}

export async function createBarangTransaksi(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/barang-masuk-keluar"))) {
    return { error: "Anda tidak memiliki izin untuk mengelola transaksi barang" }
  }

  const barangId = formData.get("barangId") as string
  const tanggal = formData.get("tanggal") as string
  const jenis = formData.get("jenis") as string
  const jumlah = parseInt(formData.get("jumlah") as string) || 0
  const keterangan = (formData.get("keterangan") as string || "").trim()

  if (!barangId || !tanggal) return { error: "Barang dan tanggal harus diisi" }
  if (jenis !== "Masuk" && jenis !== "Keluar") return { error: "Jenis transaksi tidak valid" }
  if (jumlah <= 0) return { error: "Jumlah harus lebih dari 0" }

  const barang = await prisma.barang.findUnique({ where: { id: barangId } })
  if (!barang) return { error: "Barang tidak ditemukan" }

  if (jenis === "Keluar" && barang.stok < jumlah) {
    return { error: `Stok tidak mencukupi. Stok "${barang.nama}" saat ini: ${barang.stok}` }
  }

  const stokBaru = barang.stok + stokEffect(jenis, jumlah)

  await prisma.$transaction([
    prisma.barangTransaksi.create({
      data: {
        barangId,
        tanggal: new Date(tanggal),
        jenis,
        jumlah,
        keterangan: keterangan || null,
      },
    }),
    prisma.barang.update({ where: { id: barangId }, data: { stok: stokBaru } }),
  ])

  revalidatePath("/admin/barang-masuk-keluar")
  revalidatePath("/admin/barang")
  return { success: true }
}

export async function updateBarangTransaksi(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/barang-masuk-keluar"))) {
    return { error: "Anda tidak memiliki izin untuk mengelola transaksi barang" }
  }

  const barangId = formData.get("barangId") as string
  const tanggal = formData.get("tanggal") as string
  const jenis = formData.get("jenis") as string
  const jumlah = parseInt(formData.get("jumlah") as string) || 0
  const keterangan = (formData.get("keterangan") as string || "").trim()

  if (!barangId || !tanggal) return { error: "Barang dan tanggal harus diisi" }
  if (jenis !== "Masuk" && jenis !== "Keluar") return { error: "Jenis transaksi tidak valid" }
  if (jumlah <= 0) return { error: "Jumlah harus lebih dari 0" }

  const existing = await prisma.barangTransaksi.findUnique({ where: { id } })
  if (!existing) return { error: "Transaksi tidak ditemukan" }

  const transaksiData = {
    barangId,
    tanggal: new Date(tanggal),
    jenis,
    jumlah,
    keterangan: keterangan || null,
  }

  // Barang sama: batalkan efek lama, lalu terapkan efek baru pada barang yang sama.
  if (existing.barangId === barangId) {
    const barang = await prisma.barang.findUnique({ where: { id: barangId } })
    if (!barang) return { error: "Barang tidak ditemukan" }

    const stokBaru = barang.stok - stokEffect(existing.jenis, existing.jumlah) + stokEffect(jenis, jumlah)
    if (stokBaru < 0) {
      return { error: `Stok tidak mencukupi. Stok "${barang.nama}" saat ini: ${barang.stok}` }
    }

    await prisma.$transaction([
      prisma.barangTransaksi.update({ where: { id }, data: transaksiData }),
      prisma.barang.update({ where: { id: barangId }, data: { stok: stokBaru } }),
    ])
  } else {
    // Barang diganti: batalkan efek lama pada barang asal, terapkan efek baru pada barang baru.
    const oldBarang = await prisma.barang.findUnique({ where: { id: existing.barangId } })
    const newBarang = await prisma.barang.findUnique({ where: { id: barangId } })
    if (!oldBarang || !newBarang) return { error: "Barang tidak ditemukan" }

    const oldStok = oldBarang.stok - stokEffect(existing.jenis, existing.jumlah)
    const newStok = newBarang.stok + stokEffect(jenis, jumlah)
    if (newStok < 0) {
      return { error: `Stok tidak mencukupi. Stok "${newBarang.nama}" saat ini: ${newBarang.stok}` }
    }

    await prisma.$transaction([
      prisma.barangTransaksi.update({ where: { id }, data: transaksiData }),
      prisma.barang.update({ where: { id: existing.barangId }, data: { stok: Math.max(oldStok, 0) } }),
      prisma.barang.update({ where: { id: barangId }, data: { stok: newStok } }),
    ])
  }

  revalidatePath("/admin/barang-masuk-keluar")
  revalidatePath("/admin/barang")
  return { success: true }
}

export async function deleteBarangTransaksi(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/barang-masuk-keluar"))) {
    return { error: "Anda tidak memiliki izin untuk menghapus transaksi barang" }
  }

  const existing = await prisma.barangTransaksi.findUnique({ where: { id } })
  if (!existing) return { error: "Transaksi tidak ditemukan" }

  // Hapus transaksi dan kembalikan stok ke kondisi sebelum transaksi.
  const barang = await prisma.barang.findUnique({ where: { id: existing.barangId } })
  const stokBaru = (barang?.stok || 0) - stokEffect(existing.jenis, existing.jumlah)

  await prisma.$transaction([
    prisma.barang.update({ where: { id: existing.barangId }, data: { stok: Math.max(stokBaru, 0) } }),
    prisma.barangTransaksi.delete({ where: { id } }),
  ])

  revalidatePath("/admin/barang-masuk-keluar")
  revalidatePath("/admin/barang")
  return { success: true }
}

/**
 * Ambil SEMUA transaksi yang cocok dengan filter aktif (tanpa pagination)
 * untuk keperluan export Excel. Dipanggil dari tombol Export di halaman riwayat.
 */
export async function exportBarangTransaksis(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/barang-masuk-keluar"))) {
    return { error: "Anda tidak memiliki izin untuk mengekspor data barang" }
  }

  const jenis = formData.get("jenis") as string
  const barangId = formData.get("barangId") as string
  const dari = formData.get("dari") as string
  const sampai = formData.get("sampai") as string

  // Filter identik dengan halaman riwayat (helper yang sama)
  const where = buildBarangTransaksiWhere({ jenis, barangId, dari, sampai })

  const rows = await prisma.barangTransaksi.findMany({
    where,
    include: { barang: { select: { nama: true } } },
    orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
  })

  return rows.map((r) => ({
    nama: r.barang.nama,
    tanggal: new Date(r.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    jenis: r.jenis,
    jumlah: r.jumlah,
    keterangan: r.keterangan || "",
  }))
}

// ==================== SOS ====================

export async function getSosMessages() {
  return prisma.sosMessage.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function createSosMessage(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/sos"))) {
    return { error: "Anda tidak memiliki izin untuk mengelola SOS" }
  }

  const memberId = (formData.get("memberId") as string || "").trim()
  const nama = (formData.get("nama") as string || "").trim()
  const region = (formData.get("region") as string || "").trim()
  const hp = (formData.get("hp") as string || "").trim()
  const latitude = parseFloat(formData.get("latitude") as string) || null
  const longitude = parseFloat(formData.get("longitude") as string) || null
  const kebutuhan = (formData.get("kebutuhan") as string || "").trim()
  const status = (formData.get("status") as string || "Open").trim()

  if (!nama) return { error: "Nama harus diisi" }
  if (!hp) return { error: "No HP harus diisi" }
  if (!kebutuhan) return { error: "Kebutuhan harus diisi" }
  if (status !== "Open" && status !== "Close") return { error: "Status tidak valid" }

  await prisma.sosMessage.create({
    data: {
      memberId: memberId || null,
      nama,
      region: region || null,
      hp,
      latitude,
      longitude,
      kebutuhan,
      status,
    },
  })

  revalidatePath("/admin/sos")
  return { success: true }
}

export async function updateSosMessage(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/sos"))) {
    return { error: "Anda tidak memiliki izin untuk mengelola SOS" }
  }

  const existing = await prisma.sosMessage.findUnique({ where: { id } })
  if (!existing) return { error: "Data SOS tidak ditemukan" }

  const memberId = (formData.get("memberId") as string || "").trim()
  const nama = (formData.get("nama") as string || "").trim()
  const region = (formData.get("region") as string || "").trim()
  const hp = (formData.get("hp") as string || "").trim()
  const latitude = parseFloat(formData.get("latitude") as string) || null
  const longitude = parseFloat(formData.get("longitude") as string) || null
  const kebutuhan = (formData.get("kebutuhan") as string || "").trim()
  const status = (formData.get("status") as string || "Open").trim()

  if (!nama) return { error: "Nama harus diisi" }
  if (!hp) return { error: "No HP harus diisi" }
  if (!kebutuhan) return { error: "Kebutuhan harus diisi" }
  if (status !== "Open" && status !== "Close") return { error: "Status tidak valid" }

  await prisma.sosMessage.update({
    where: { id },
    data: {
      memberId: memberId || null,
      nama,
      region: region || null,
      hp,
      latitude,
      longitude,
      kebutuhan,
      status,
    },
  })

  revalidatePath("/admin/sos")
  return { success: true }
}

export async function deleteSosMessage(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!(await canAccessAdminMenu(session.user.id, "/admin/sos"))) {
    return { error: "Anda tidak memiliki izin untuk menghapus SOS" }
  }

  const existing = await prisma.sosMessage.findUnique({ where: { id } })
  if (!existing) return { error: "Data SOS tidak ditemukan" }

  await prisma.sosMessage.delete({ where: { id } })
  revalidatePath("/admin/sos")
  return { success: true }
}

export async function lookupMemberById(memberId: string) {
  const session = await auth()
  if (!session?.user?.id) return null
  if (!(await canAccessAdminMenu(session.user.id, "/admin/sos"))) return null

  const member = await prisma.prospectiveMember.findUnique({
    where: { memberId },
    select: {
      namaLengkap: true,
      region: true,
      noWa: true,
    },
  })

  if (!member) return null
  return {
    nama: member.namaLengkap,
    region: member.region,
    hp: member.noWa,
  }
}

// ==================== PENGURUS ====================

export async function getPenguruses() {
  return prisma.pengurus.findMany({
    orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
  })
}

export async function createPengurus(_prevState: any, formData: FormData) {
  const memberId = formData.get("memberId") as string
  const nama = formData.get("nama") as string
  const jabatan = formData.get("jabatan") as string
  const foto = formData.get("foto") as string
  const tentang = formData.get("tentang") as string
  const urutan = parseInt(formData.get("urutan") as string) || 0

  if (!nama || !jabatan) return { error: "Nama dan jabatan harus diisi" }

  await prisma.pengurus.create({
    data: {
      memberId: memberId || null,
      nama,
      jabatan,
      foto: foto || null,
      tentang: tentang || null,
      urutan,
    },
  })

  revalidatePath("/admin/pengurus")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function updatePengurus(id: string, _prevState: any, formData: FormData) {
  const memberId = formData.get("memberId") as string
  const nama = formData.get("nama") as string
  const jabatan = formData.get("jabatan") as string
  const foto = formData.get("foto") as string
  const tentang = formData.get("tentang") as string
  const urutan = parseInt(formData.get("urutan") as string) || 0
  const isActive = formData.get("isActive") === "true"

  if (!nama || !jabatan) return { error: "Nama dan jabatan harus diisi" }

  const existing = await prisma.pengurus.findUnique({ where: { id } })
  if (!existing) return { error: "Data pengurus tidak ditemukan" }

  await prisma.pengurus.update({
    where: { id },
    data: {
      memberId: memberId || null,
      nama,
      jabatan,
      foto: foto || existing.foto,
      tentang: tentang || null,
      urutan,
      isActive,
    },
  })

  revalidatePath("/admin/pengurus")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function deletePengurus(id: string) {
  await prisma.pengurus.delete({ where: { id } })
  revalidatePath("/admin/pengurus")
  revalidatePath("/", "layout")
  return { success: true }
}
