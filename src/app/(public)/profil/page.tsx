import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil",
  description: "Profil SMA Annajah - Visi, Misi, Sejarah, dan Informasi Sekolah",
};

export default async function ProfilePage() {
  const profile = await prisma.siteProfile.findFirst({ where: { id: 1 } });

  return (
    <div className="min-h-screen">
      <Breadcrumb items={[{ label: "Profil" }]} />
      {/* Hero */}
      <section className="bg-gradient-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Profil {profile?.shortName || "SMA Annajah"}
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Mengenal lebih dekat SMA Annajah
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary-900 mb-4">Tentang Kami</h2>
              {profile?.about ? (
                <div className="text-gray-600 leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-primary-900 [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-primary-900 [&_h3]:mb-2 [&_h3]:mt-4 [&_img]:rounded-xl [&_img]:my-4 [&_img]:max-w-full [&_a]:text-primary-600 [&_a]:underline [&_a]:hover:text-primary-800 [&_hr]:my-6 [&_hr]:border-gray-300" dangerouslySetInnerHTML={{ __html: profile.about }} />
              ) : (
                <div className="text-gray-600 leading-relaxed">
                  <p>{profile?.schoolName || "SMA Annajah"} adalah sekolah menengah atas yang berkomitmen untuk memberikan pendidikan terbaik bagi generasi muda Indonesia.</p>
                </div>
              )}
            </div>
            <div className="bg-gradient-primary-light rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary-900">{profile?.teacherCount || "35"}</p>
                  <p className="text-sm text-gray-600 mt-1">Tenaga Pengajar</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary-900">{profile?.studentCount || "500"}</p>
                  <p className="text-sm text-gray-600 mt-1">Siswa Aktif</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary-900">{profile?.establishedYears || "10"}</p>
                  <p className="text-sm text-gray-600 mt-1">Tahun Berdiri</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary-900">{profile?.achievementCount || "50"}</p>
                  <p className="text-sm text-gray-600 mt-1">Prestasi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      {(profile?.vision || profile?.mission) && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-900 mb-4">
                Visi & Misi
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {profile?.vision && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-3">Visi</h3>
                  <div className="text-gray-700 leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-2" dangerouslySetInnerHTML={{ __html: profile.vision }} />
                </div>
              )}
              {profile?.mission && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-3">Misi</h3>
                  <div className="text-gray-700 leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-2" dangerouslySetInnerHTML={{ __html: profile.mission }} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* History */}
      {profile?.history && (
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-primary-900 mb-8 text-center">
                Sejarah
              </h2>
              <div className="relative pl-8 border-l-4 border-primary-200">
                <div className="text-gray-600 leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-2" dangerouslySetInnerHTML={{ __html: profile.history }} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Info */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-900 mb-4">
              Informasi Kontak
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Hubungi kami untuk informasi lebih lanjut
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {profile?.address && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Alamat</h3>
                <p className="text-gray-600 text-sm">{profile.address}</p>
              </div>
            )}
            {profile?.phone && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Telepon</h3>
                <p className="text-gray-600 text-sm">{profile.phone}</p>
              </div>
            )}
            {profile?.email && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 text-sm">{profile.email}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
