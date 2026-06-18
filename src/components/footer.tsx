import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getFooterData() {
  const [profile, menus] = await Promise.all([
    prisma.siteProfile.findFirst({ where: { id: 1 } }),
    prisma.menu.findFirst({
      where: { location: "main" },
      include: {
        items: {
          where: { parentId: null, isActive: true },
          orderBy: { order: "asc" },
          include: { page: true },
        },
      },
    }),
  ]);
  return { profile, menuItems: menus?.items || [] };
}

function SchoolLogo({ logo, schoolName, className }: { logo: string | null | undefined; schoolName: string; className?: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={schoolName}
        className={className || "w-10 h-10 object-contain"}
      />
    );
  }
  return (
    <div className={`${className || "w-10 h-10"} bg-primary-900 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
      {schoolName.charAt(0)}
    </div>
  );
}

export async function Footer() {
  const { profile, menuItems } = await getFooterData();
  const schoolName = profile?.shortName || "SMA Annajah";
  const schoolFull = profile?.schoolName || "SMA Annajah";

  const navItems = menuItems.length > 0
    ? menuItems
    : [
        { label: "Profil", href: "/profil" },
        { label: "Berita", href: "/berita" },
        { label: "Galeri", href: "/galeri" },
        { label: "Kontak", href: "/kontak" },
      ];

  function getItemHref(item: any): string {
    if (item.page) return `/${item.page.slug}`;
    if (item.url) return item.url;
    return "#";
  }

  return (
    <footer className="bg-primary-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Kolom 1: Ringkasan SMA Annajah */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <SchoolLogo logo={profile?.logo} schoolName={schoolFull} className="w-10 h-10 object-contain" />
              <h3 className="font-bold text-lg">{schoolName}</h3>
            </div>
            <p className="text-primary-200 text-sm leading-relaxed">
              {profile?.description || "SMA Annajah adalah sekolah menengah atas yang berkomitmen untuk mencetak generasi unggul, berakhlak mulia, dan berprestasi."}
            </p>
            <p className="text-primary-300 text-xs mt-3">
              {profile?.slogan || "Mewujudkan Generasi Berprestasi"}
            </p>
            {/* Social Media */}
            <div className="flex gap-3 mt-5">
              {profile?.facebookUrl && (
                <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {profile?.instagramUrl && (
                <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {profile?.youtubeUrl && (
                <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              )}
            </div>
          </div>          {/* Kolom 2: Navigasi */}
          <div>
            <h4 className="font-semibold text-white mb-5">Navigasi</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-primary-300 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Beranda
                </Link>
              </li>
              {navItems.map((item: any) => (
                <li key={item.id || item.label}>
                  <Link
                    href={getItemHref(item)}
                    className="text-primary-300 hover:text-white text-sm transition-colors flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Kontak */}
          <div>
            <h4 className="font-semibold text-white mb-5">Kontak</h4>
            <ul className="space-y-4 text-sm text-primary-300">
              {profile?.address && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium mb-0.5">Alamat</p>
                    <span className="text-primary-200">{profile.address}</span>
                  </div>
                </li>
              )}
              {profile?.phone && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium mb-0.5">Telepon</p>
                    <a href={`tel:${profile.phone}`} className="text-primary-200 hover:text-white transition-colors">{profile.phone}</a>
                  </div>
                </li>
              )}
              {profile?.email && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium mb-0.5">Email</p>
                    <a href={`mailto:${profile.email}`} className="text-primary-200 hover:text-white transition-colors">{profile.email}</a>
                  </div>
                </li>
              )}
              {profile?.website && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium mb-0.5">Website</p>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-200 hover:text-white transition-colors">{profile.website}</a>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-800">
          <p className="text-primary-300 text-sm text-center">
            &copy; {new Date().getFullYear()} {schoolFull}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
