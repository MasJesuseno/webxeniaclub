import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: "super-admin" },
    update: {},
    create: {
      name: "super-admin",
      displayName: "Super Admin",
      isSystem: true,
    },
  })

  await prisma.role.upsert({
    where: { name: "editor" },
    update: {},
    create: {
      name: "editor",
      displayName: "Editor",
      isSystem: true,
    },
  })

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@xeniaclub.or.id" },
    update: {},
    create: {
      name: "Admin DXIC",
      username: "admin",
      email: "admin@xeniaclub.or.id",
      password: hashedPassword,
      isActive: true,
    },
  })

  // Assign role to admin
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: superAdminRole.id } },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  })

  // Create site profile
  const profile = await prisma.siteProfile.findFirst()
  if (!profile) {
    await prisma.siteProfile.create({
      data: {
        clubName: "Daihatsu Xenia Indonesia Club",
        shortName: "DXIC",
        slogan: "Xenia Menyatukan Kita",
        description: "Komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia. Wadah silaturahmi, berbagi pengalaman, dan informasi seputar Daihatsu Xenia.",
        vision: "Menjadi komunitas Daihatsu Xenia terbesar dan terbaik di Indonesia yang solid, informatif, dan bermanfaat bagi seluruh anggota.",
        mission: "Mempererat silaturahmi antar sesama pemilik Xenia\nBerbagi informasi dan tips perawatan Xenia\nMengadakan kegiatan sosial dan kopdar rutin\nMenjadi wadah informasi terpercaya seputar Xenia",
        memberCount: 500,
        cityCount: 30,
        establishedYear: "2010",
        primaryColor: "#DC2626",
        instagramUrl: "https://instagram.com/xeniaclub",
        youtubeUrl: "https://youtube.com/@xeniaclub",
        facebookUrl: "https://facebook.com/xeniaclub",
      },
    })
  }

  // Create categories
  const kegiatanCat = await prisma.category.upsert({
    where: { slug: "kegiatan" },
    update: {},
    create: { name: "Kegiatan", slug: "kegiatan", color: "#DC2626" },
  })

  await prisma.category.upsert({
    where: { slug: "kopdar" },
    update: {},
    create: { name: "Kopdar", slug: "kopdar", color: "#2563EB" },
  })

  await prisma.category.upsert({
    where: { slug: "info" },
    update: {},
    create: { name: "Info", slug: "info", color: "#059669" },
  })

  await prisma.category.upsert({
    where: { slug: "tips" },
    update: {},
    create: { name: "Tips & Trik", slug: "tips", color: "#D97706" },
  })

  // Create sample posts
  const tipsCategory = await prisma.category.findUnique({ where: { slug: "tips" } })
  const posts = [
    {
      title: "Kopdar Akbar DXIC 2025 Sukses Digelar",
      content: "<p>Acara Kopdar Akbar DXIC 2025 yang diselenggarakan di Bandung pada akhir pekan lalu berlangsung meriah. Lebih dari 200 anggota dari berbagai kota hadir dalam acara ini.</p><p>Acara dimulai dengan konvoi keliling kota Bandung, dilanjutkan dengan gathering di sebuah rest area. Berbagai kegiatan seru seperti games, doorprize, dan sesi foto bersama mewarnai acara ini.</p>",
      excerpt: "Acara Kopdar Akbar DXIC 2025 di Bandung berlangsung meriah dengan dihadiri lebih dari 200 anggota dari berbagai kota.",
      slug: "kopdar-akbar-dxic-2025-sukses-digelar",
      categoryId: kegiatanCat.id,
    },
    {
      title: "Tips Perawatan Daihatsu Xenia agar Tetap Prima",
      content: "<p>Merawat Daihatsu Xenia dengan baik akan membuat mobil kesayangan Anda tetap prima dan nyaman dikendarai. Berikut beberapa tips perawatan yang bisa Anda lakukan:</p><h2>1. Rutin Ganti Oli</h2><p>Ganti oli mesin setiap 5.000 km atau 3 bulan sekali untuk menjaga performa mesin tetap optimal.</p><h2>2. Periksa Tekanan Ban</h2><p>Pastikan tekanan ban selalu sesuai standar untuk kenyamanan berkendara dan efisiensi bahan bakar.</p>",
      excerpt: "Tips lengkap merawat Daihatsu Xenia agar tetap prima dan nyaman dikendarai sehari-hari.",
      slug: "tips-perawatan-daihatsu-xenia-agar-tetap-prima",
      categoryId: tipsCategory?.id || "",
    },
    {
      title: "DXIC Gelar Bakti Sosial di Panti Asuhan",
      content: "<p>DXIC kembali mengadakan kegiatan bakti sosial dengan mengunjungi panti asuhan di Jakarta. Kegiatan ini merupakan bagian dari program sosial DXIC yang rutin dilaksanakan setiap 3 bulan sekali.</p><p>Dalam kegiatan ini, anggota DXIC memberikan bantuan sembako, alat tulis, dan perlengkapan sekolah.</p>",
      excerpt: "Kegiatan bakti sosial DXIC di panti asuhan Jakarta sebagai wujud kepedulian terhadap sesama.",
      slug: "dxic-gelar-bakti-sosial-di-panti-asuhan",
      categoryId: kegiatanCat.id,
    },
  ]

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        authorId: adminUser.id,
        status: "published",
        featured: true,
        publishedAt: new Date(),
        image: null,
      },
    })
  }

  // Create sample menus
  const headerMenu = await prisma.menu.upsert({
    where: { location: "header" },
    update: {},
    create: { name: "Header Menu", location: "header" },
  })

  await prisma.menu.upsert({
    where: { location: "footer" },
    update: {},
    create: { name: "Footer Menu", location: "footer" },
  })

  // Create menu items
  const profilPage = await prisma.page.findFirst({ where: { slug: "profil" } })
  if (!profilPage) {
    const page = await prisma.page.create({
      data: {
        title: "Profil",
        slug: "profil",
        content: "<h2>Tentang DXIC</h2><p>DXIC (Daihatsu Xenia Indonesia Club) adalah komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia.</p>",
        status: "published",
      },
    })

    await prisma.menuItem.create({
      data: {
        label: "Profil",
        pageId: page.id,
        menuId: headerMenu.id,
        order: 0,
      },
    })
  }

  // Create sample testimonials
  const testimonials = [
    { name: "Andi Pratama", title: "Anggota DXIC Jakarta", content: "Bergabung dengan DXIC adalah pengalaman yang luar biasa. Banyak teman baru, ilmu baru tentang perawatan Xenia, dan tentunya kopdar yang seru!", order: 0 },
    { name: "Budi Santoso", title: "Anggota DXIC Bandung", content: "DXIC bukan sekadar komunitas, sudah seperti keluarga kedua. Solidaritas antar anggota sangat kuat. Salam Xenia!", order: 1 },
    { name: "Citra Dewi", title: "Anggota DXIC Surabaya", content: "Senang sekali bisa bergabung di DXIC. Banyak informasi bermanfaat, dari perawatan mobil hingga rekomendasi bengkel terpercaya.", order: 2 },
    { name: "Deni Nugroho", title: "Anggota DXIC Yogyakarta", content: "Kopdar pertama saya dengan DXIC sangat berkesan. Semua anggota ramah dan welcome banget. Terima kasih DXIC!", order: 3 },
  ]

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: { ...t, isActive: true } })
  }

  // Create sample partners
  const partners = [
    {
      name: "Astra Daihatsu Motor",
      description: "Produsen resmi mobil Daihatsu di Indonesia, mitra utama DXIC dalam berbagai kegiatan dan event.",
      website: "https://www.daihatsu.co.id",
      order: 0,
    },
    {
      name: "Pertamina",
      description: "Mitra bahan bakar resmi untuk kegiatan kopdar dan touring DXIC di seluruh Indonesia.",
      website: "https://www.pertamina.com",
      order: 1,
    },
    {
      name: "Planet Ban",
      description: "Mitra resmi layanan ban dan perawatan ban untuk anggota DXIC dengan harga spesial.",
      website: "https://www.planetban.com",
      order: 2,
    },
    {
      name: "GardX Indonesia",
      description: "Mitra perlindungan cat dan coating mobil untuk komunitas DXIC.",
      website: "https://www.gardx.co.id",
      order: 3,
    },
    {
      name: "Shell Indonesia",
      description: "Mitra pelumas dan bahan bakar berkualitas untuk performa Xenia terbaik.",
      website: "https://www.shell.co.id",
      order: 4,
    },
    {
      name: "Modifikasi Xenia",
      description: "Workshop spesialis modifikasi Daihatsu Xenia, partner resmi DXIC dalam urusan aksesoris.",
      website: "https://instagram.com/modifikasixenia",
      order: 5,
    },
  ]

  for (const partner of partners) {
    await prisma.partner.create({
      data: {
        ...partner,
        logo: "/uploads/logo-placeholder.svg",
        isActive: true,
      },
    })
  }

  // Create settings
  const settings = [
    { key: "site_description", value: "DXIC - Daihatsu Xenia Indonesia Club. Komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia." },
    { key: "site_keywords", value: "DXIC, Xenia Club Indonesia, Daihatsu Xenia, Komunitas Xenia, Mobil Xenia" },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log("Database seeding completed!")
  console.log("Admin login: admin@xeniaclub.or.id / admin123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
