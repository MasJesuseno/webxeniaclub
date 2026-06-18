import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "super_admin" },
    update: {},
    create: {
      name: "super_admin",
      displayName: "Super Admin",
      description: "Akses penuh ke seluruh sistem",
      isSystem: true,
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: "editor" },
    update: {},
    create: {
      name: "editor",
      displayName: "Editor",
      description: "Dapat mengelola konten (postingan, halaman, galeri)",
      isSystem: true,
    },
  });

  const authorRole = await prisma.role.upsert({
    where: { name: "author" },
    update: {},
    create: {
      name: "author",
      displayName: "Penulis",
      description: "Dapat menulis dan mengelola postingan sendiri",
      isSystem: true,
    },
  });

  console.log("✅ Roles created");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@smaannajah.sch.id" },
    update: {},
    create: {
      name: "Admin SMA Annajah",
      email: "admin@smaannajah.sch.id",
      password: adminPassword,
      isActive: true,
    },
  });

  // Assign roles to admin
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: editorRole.id } },
    update: {},
    create: { userId: admin.id, roleId: editorRole.id },
  });

  console.log("✅ Admin user created (email: admin@smaannajah.sch.id, password: admin123)");

  // Create categories
  const categories = [
    { name: "Akademik", color: "#3B82F6", description: "Informasi akademik sekolah" },
    { name: "Kegiatan", color: "#10B981", description: "Kegiatan dan event sekolah" },
    { name: "Prestasi", color: "#F59E0B", description: "Prestasi siswa dan sekolah" },
    { name: "Pengumuman", color: "#EF4444", description: "Pengumuman resmi sekolah" },
    { name: "Olahraga", color: "#8B5CF6", description: "Kegiatan olahraga" },
    { name: "Seni & Budaya", color: "#EC4899", description: "Kegiatan seni dan budaya" },
  ];

  for (const cat of categories) {
    const { name, color, description } = cat;
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: name.toLowerCase().replace(/[&\s]+/g, "-"),
        color,
        description,
      },
    });
  }

  console.log("✅ Categories created");

  // Create tags
  const tags = ["Prestasi", "Lomba", "Olimpiade", "Ekstrakurikuler", "OSIS", "UKS", "Pramuka"];
  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, slug: name.toLowerCase() },
    });
  }

  console.log("✅ Tags created");

  // Create sample posts
  const samplePosts = [
    {
      title: "Selamat Datang Tahun Ajaran Baru 2024/2025",
      slug: "selamat-datang-tahun-ajaran-baru-2024-2025",
      content: `<h2>Selamat Datang Siswa Baru!</h2>
<p>SMA Annajah dengan bangga menyambut seluruh siswa baru tahun ajaran 2024/2025. Kami berharap kalian dapat mengikuti seluruh rangkaian kegiatan belajar mengajar dengan baik.</p>
<p>Tahun ajaran baru ini membawa semangat baru untuk terus berprestasi dan mengembangkan potensi diri. Mari kita jadikan tahun ajaran ini sebagai momentum untuk meraih prestasi terbaik.</p>
<h3>Informasi Penting</h3>
<ul>
<li>Kegiatan MPLS akan dilaksanakan pada minggu pertama</li>
<li>Seragam sekolah sudah tersedia di koperasi sekolah</li>
<li>Buku pelajaran dapat diambil di perpustakaan</li>
</ul>`,
      excerpt: "SMA Annajah menyambut tahun ajaran baru 2024/2025 dengan penuh semangat. Mari raih prestasi bersama!",
      status: "published",
      featured: true,
      categoryName: "Pengumuman",
      tags: ["OSIS", "Ekstrakurikuler"],
    },
    {
      title: "Siswa SMA Annajah Raih Medali Emas Olimpiade Sains Nasional",
      slug: "siswa-raih-medali-emas-olimpiade-sains-nasional",
      content: `<h2>Prestasi Gemilang!</h2>
<p>Selamat kepada siswa SMA Annajah yang berhasil meraih medali emas dalam Olimpiade Sains Nasional tingkat provinsi. Prestasi ini membuktikan kualitas pendidikan di SMA Annajah.</p>
<p>Keberhasilan ini tidak terlepas dari kerja keras siswa dan bimbingan para guru yang telah mendampingi selama persiapan.</p>`,
      excerpt: "Prestasi membanggakan diraih oleh siswa SMA Annajah dalam ajang Olimpiade Sains Nasional.",
      status: "published",
      featured: true,
      categoryName: "Prestasi",
      tags: ["Prestasi", "Lomba", "Olimpiade"],
    },
    {
      title: "Kegiatan Bakti Sosial SMA Annajah",
      slug: "kegiatan-bakti-sosial-sma-annajah",
      content: `<h2>Bakti Sosial</h2>
<p>SMA Annajah mengadakan kegiatan bakti sosial ke panti asuhan di sekitar wilayah sekolah. Kegiatan ini merupakan bagian dari program pengembangan karakter siswa.</p>
<p>Kegiatan bakti sosial ini diikuti oleh seluruh siswa dan guru dengan penuh antusias. Semoga kegiatan ini dapat terus berlanjut dan memberikan manfaat bagi sesama.</p>`,
      excerpt: "SMA Annajah mengadakan bakti sosial ke panti asuhan sebagai bagian dari pengembangan karakter siswa.",
      status: "published",
      featured: false,
      categoryName: "Kegiatan",
      tags: ["Ekstrakurikuler", "OSIS"],
    },
    {
      title: "Workshop Karya Ilmiah Remaja",
      slug: "workshop-karya-ilmiah-remaja",
      content: `<h2>Workshop KIR</h2>
<p>SMA Annajah menyelenggarakan workshop Karya Ilmiah Remaja (KIR) bagi siswa-siswi yang tertarik dengan dunia penelitian dan penulisan ilmiah.</p>
<p>Workshop ini menghadirkan pemateri dari perguruan tinggi ternama yang akan membimbing siswa dalam menyusun karya tulis ilmiah yang berkualitas.</p>`,
      excerpt: "Workshop KIR bagi siswa yang tertarik dengan penelitian dan penulisan ilmiah.",
      status: "published",
      featured: false,
      categoryName: "Akademik",
      tags: ["Prestasi", "Lomba"],
    },
  ];

  for (const postData of samplePosts) {
    const category = await prisma.category.findUnique({
      where: { name: postData.categoryName },
    });

    const post = await prisma.post.upsert({
      where: { slug: postData.slug },
      update: {},
      create: {
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        excerpt: postData.excerpt,
        status: postData.status,
        featured: postData.featured,
        categoryId: category?.id || null,
        authorId: admin.id,
        publishedAt: new Date(),
      },
    });

    // Add tags
    for (const tagName of postData.tags) {
      const tag = await prisma.tag.findUnique({ where: { name: tagName } });
      if (tag) {
        await prisma.postTag.upsert({
          where: { postId_tagId: { postId: post.id, tagId: tag.id } },
          update: {},
          create: { postId: post.id, tagId: tag.id },
        });
      }
    }
  }

  console.log("✅ Sample posts created");

  // Create profile
  await prisma.siteProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      schoolName: "SMA Annajah",
      shortName: "SMA Annajah",
      slogan: "Mewujudkan Generasi Berprestasi & Berakhlak Mulia",
      description: "SMA Annajah adalah sekolah menengah atas yang berkomitmen untuk mencetak generasi unggul, berakhlak mulia, dan berprestasi di era global. Dengan tenaga pengajar profesional dan fasilitas modern, kami siap mendampingi putra-putri Anda meraih masa depan gemilang.",
      address: "Jl. Pendidikan No. 123, Kecamatan, Kota",
      phone: "(021) 1234-5678",
      email: "info@smaannajah.sch.id",
      website: "https://smaannajah.sch.id",
      vision: "Menjadi sekolah menengah atas unggulan yang menghasilkan generasi beriman, berilmu, berakhlak mulia, dan berwawasan global pada tahun 2030.",
      mission: "1. Menyelenggarakan pendidikan berkualitas berbasis iman dan taqwa\n2. Mengembangkan potensi akademik dan non-akademik siswa secara optimal\n3. Membentuk karakter siswa yang berakhlak mulia dan berbudaya\n4. Meningkatkan kompetensi tenaga pendidik dan kependidikan\n5. Menjalin kerjasama dengan berbagai pihak untuk pengembangan sekolah",
      primaryColor: "#1e40af",
      about: "SMA Annajah berdiri dengan semangat untuk memberikan kontribusi nyata dalam dunia pendidikan Indonesia. Dengan pengalaman lebih dari 10 tahun, kami telah melahirkan ribuan lulusan yang berprestasi dan sukses di berbagai bidang.",
      history: "SMA Annajah didirikan pada tahun 2010 dengan tujuan untuk menyediakan pendidikan menengah atas yang berkualitas dan terjangkau bagi masyarakat. Sejak awal berdiri, sekolah ini telah mengalami berbagai perkembangan signifikan baik dari segi infrastruktur maupun kualitas pendidikan.\n\nPada tahun 2015, SMA Annajah berhasil meraih akreditasi A dan sejak saat itu terus berupaya meningkatkan standar pendidikan. Berbagai prestasi telah diraih oleh siswa-siswi SMA Annajah baik di tingkat kota, provinsi, maupun nasional.",
    },
  });

  console.log("✅ Site profile created");

  // Create menus
  const mainMenu = await prisma.menu.upsert({
    where: { name: "Menu Utama" },
    update: {},
    create: { name: "Menu Utama", location: "main" },
  });

  // Add menu items individually to avoid duplicate issues
  const existingItems = await prisma.menuItem.findMany({ where: { menuId: mainMenu.id } });
  if (existingItems.length === 0) {
    await prisma.menuItem.createMany({
      data: [
        { label: "Tentang Kami", url: "/profil", menuId: mainMenu.id, order: 0 },
        { label: "Program", url: "/profil#program", menuId: mainMenu.id, order: 1 },
        { label: "Fasilitas", url: "/fasilitas", menuId: mainMenu.id, order: 2 },
      ],
    });
  }

  console.log("✅ Menu created");

  // Create albums
  const album1 = await prisma.album.upsert({
    where: { slug: "kegiatan-sekolah" },
    update: {},
    create: {
      title: "Kegiatan Sekolah",
      slug: "kegiatan-sekolah",
      description: "Dokumentasi berbagai kegiatan sekolah",
    },
  });

  const album2 = await prisma.album.upsert({
    where: { slug: "prestasi-siswa" },
    update: {},
    create: {
      title: "Prestasi Siswa",
      slug: "prestasi-siswa",
      description: "Momen kebahagiaan saat peraih prestasi",
    },
  });

  console.log("✅ Albums created");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
