"use client";

import { useState, useRef } from "react";
import { updateProfile } from "./actions";
import { colorPresets } from "@/lib/color-palette";
import { ContentEditor } from "@/components/content-editor";

type Profile = {
  id: number;
  schoolName: string;
  shortName: string;
  slogan: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
  favicon: string | null;
  vision: string | null;
  mission: string | null;
  about: string | null;
  history: string | null;
  primaryColor: string;
  homeBanner: string | null;
  homeBannerBrightness: number;
  teacherCount: string;
  studentCount: string;
  establishedYears: string;
  achievementCount: string;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  feature3Title: string;
  feature3Description: string;
  headingFont: string;
  bodyFont: string;
  operationalHours: string | null;
  ppdbUrl: string | null;
  baseFontSize: string;
  headingWeight: string;
} | null;

export function SettingsForm({ profile }: { profile: Profile }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(profile?.primaryColor || "#1e40af");
  const [brightness, setBrightness] = useState(profile?.homeBannerBrightness ?? 35);
  const [activeTab, setActiveTab] = useState<"umum" | "tampilan" | "tipografi">("umum");
  const [headingFont, setHeadingFont] = useState(profile?.headingFont || "Inter");
  const [bodyFont, setBodyFont] = useState(profile?.bodyFont || "Inter");
  const [baseFontSize, setBaseFontSize] = useState(profile?.baseFontSize || "16");
  const [headingWeight, setHeadingWeight] = useState(profile?.headingWeight || "700");

  // Content Editor states for rich text fields
  const [contentDescription, setContentDescription] = useState(profile?.description || "");
  const [contentVision, setContentVision] = useState(profile?.vision || "");
  const [contentMission, setContentMission] = useState(profile?.mission || "");
  const [contentAbout, setContentAbout] = useState(profile?.about || "");
  const [contentHistory, setContentHistory] = useState(profile?.history || "");

  const contentFields = ["description", "vision", "mission", "about", "history"] as const;

  function getContentState(name: string): [string, React.Dispatch<React.SetStateAction<string>>] {
    switch (name) {
      case "description": return [contentDescription, setContentDescription];
      case "vision": return [contentVision, setContentVision];
      case "mission": return [contentMission, setContentMission];
      case "about": return [contentAbout, setContentAbout];
      case "history": return [contentHistory, setContentHistory];
      default: return ["", () => {}];
    }
  }

  // Logo & Favicon upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Banner upload state
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File): Promise<string> {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: uploadFormData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal mengupload file");
    }

    const data = await res.json();
    return data.url;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setUploading(true);
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("primaryColor", primaryColor);
      // Set rich text content from ContentEditor state
      formData.set("description", contentDescription);
      formData.set("vision", contentVision);
      formData.set("mission", contentMission);
      formData.set("about", contentAbout);
      formData.set("history", contentHistory);

      // Upload logo if a new file was selected
      if (logoFile) {
        const logoUrl = await uploadFile(logoFile);
        formData.set("logo", logoUrl);
      } else if (profile?.logo) {
        formData.set("logo", profile.logo);
      }

      // Upload favicon if a new file was selected
      if (faviconFile) {
        const faviconUrl = await uploadFile(faviconFile);
        formData.set("favicon", faviconUrl);
      } else if (profile?.favicon) {
        formData.set("favicon", profile.favicon);
      }

      // Upload banner if a new file was selected
      if (bannerFile) {
        const bannerUrl = await uploadFile(bannerFile);
        formData.set("homeBanner", bannerUrl);
      } else if (profile?.homeBanner) {
        formData.set("homeBanner", profile.homeBanner);
      }

      setUploading(false);
      await updateProfile(formData);
      setSuccess(true);
      setLogoFile(null);
      setFaviconFile(null);
      setBannerFile(null);
      setLogoPreview(null);
      setFaviconPreview(null);
      setBannerPreview(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setUploading(false);
      alert(err instanceof Error ? err.message : "Gagal menyimpan pengaturan");
    } finally {
      setLoading(false);
    }
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  function handleFaviconSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  }

  const fontOptions = [
    { value: "Inter", label: "Inter", description: "Font modern sans-serif, default" },
    { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", description: "Font sans-serif elegan & modern" },
    { value: "Poppins", label: "Poppins", description: "Font sans-serif populer & bersih" },
    { value: "Roboto", label: "Roboto", description: "Font sans-serif klasik & stabil" },
    { value: "Merriweather", label: "Merriweather", description: "Font serif untuk tampilan klasik" },
    { value: "Lora", label: "Lora", description: "Font serif elegan untuk konten" },
  ];

  function handleBannerSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  }

  const generalSections = [
    {
      title: "Informasi Sekolah",
      fields: [
        { name: "schoolName", label: "Nama Sekolah", type: "text" },
        { name: "shortName", label: "Nama Singkat", type: "text" },
        { name: "slogan", label: "Slogan", type: "text" },
        { name: "description", label: "Deskripsi", type: "textarea" },
      ],
    },
    {
      title: "Kontak",
      fields: [
        { name: "address", label: "Alamat", type: "textarea" },
        { name: "phone", label: "Telepon", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "website", label: "Website", type: "url" },
        { name: "operationalHours", label: "Jam Operasional", type: "text" },
      ],
    },
    {
      title: "Tombol Daftar Sekarang",
      fields: [
        { name: "ppdbUrl", label: "URL PPDB / Daftar", type: "url" },
      ],
    },
    {
      title: "Profil Sekolah",
      fields: [
        { name: "vision", label: "Visi", type: "textarea" },
        { name: "mission", label: "Misi", type: "textarea" },
        { name: "about", label: "Tentang", type: "textarea" },
        { name: "history", label: "Sejarah", type: "textarea" },
      ],
    },
    {
      title: "Statistik Sekolah",
      fields: [
        { name: "teacherCount", label: "Jumlah Tenaga Pengajar", type: "text" },
        { name: "studentCount", label: "Jumlah Siswa Aktif", type: "text" },
        { name: "establishedYears", label: "Tahun Berdiri", type: "text" },
        { name: "achievementCount", label: "Jumlah Prestasi", type: "text" },
      ],
    },
    {
      title: "3 Poin Unggulan",
      fields: [
        { name: "feature1Title", label: "Judul Poin 1", type: "text" },
        { name: "feature1Description", label: "Deskripsi Poin 1", type: "text" },
        { name: "feature2Title", label: "Judul Poin 2", type: "text" },
        { name: "feature2Description", label: "Deskripsi Poin 2", type: "text" },
        { name: "feature3Title", label: "Judul Poin 3", type: "text" },
        { name: "feature3Description", label: "Deskripsi Poin 3", type: "text" },
      ],
    },
    {
      title: "Media Sosial",
      fields: [
        { name: "youtubeUrl", label: "YouTube", type: "url" },
        { name: "instagramUrl", label: "Instagram", type: "url" },
        { name: "facebookUrl", label: "Facebook", type: "url" },
        { name: "twitterUrl", label: "Twitter", type: "url" },
      ],
    },
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 mt-1">Pengaturan profil sekolah dan tampilan website</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("umum")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "umum"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Informasi Umum
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tampilan")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "tampilan"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Tampilan & Warna
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tipografi")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "tipografi"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Font & Tipografi
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === "umum" ? (
          <div className="space-y-6">
            {generalSections.map((section) => (
              <div key={section.title} className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h2>
                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {contentFields.includes(field.name as any) ? (
                        (() => {
                          const [val, setVal] = getContentState(field.name);
                          return (
                            <ContentEditor
                              value={val}
                              onChange={setVal}
                              placeholder={`Tulis ${field.label.toLowerCase()} di sini...`}
                            />
                          );
                        })()
                      ) : field.type === "textarea" ? (
                        <textarea
                          name={field.name}
                          rows={4}
                          defaultValue={(profile as any)?.[field.name] || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          defaultValue={(profile as any)?.[field.name] || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Logo & Favicon Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo & Favicon</h2>
              <p className="text-sm text-gray-500 mb-6">
                Upload logo dan favicon sekolah. Format yang didukung: PNG, JPG, WebP, SVG.
                Ukuran maksimal 5MB per file.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Sekolah
                  </label>
                  <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors">
                    {/* Preview */}
                    <div className="w-28 h-28 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      ) : profile?.logo ? (
                        <img
                          src={profile.logo}
                          alt="Current logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <svg className="w-10 h-10 text-gray-300 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-400">Belum ada logo</p>
                        </div>
                      )}
                    </div>

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                    <input type="hidden" name="logo" value={profile?.logo || ""} />

                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {logoFile ? "Ganti Logo" : "Pilih Logo"}
                    </button>

                    {logoFile && (
                      <p className="text-xs text-gray-500 truncate max-w-full">
                        {logoFile.name}
                      </p>
                    )}

                    {profile?.logo && !logoFile && (
                      <p className="text-xs text-gray-400">
                        Logo saat ini tersimpan
                      </p>
                    )}
                  </div>
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon
                  </label>
                  <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors">
                    {/* Preview */}
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                      {faviconPreview ? (
                        <img
                          src={faviconPreview}
                          alt="Favicon preview"
                          className="w-full h-full object-contain"
                        />
                      ) : profile?.favicon ? (
                        <img
                          src={profile.favicon}
                          alt="Current favicon"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/png,image/x-icon,image/svg+xml"
                      onChange={handleFaviconSelect}
                      className="hidden"
                    />
                    <input type="hidden" name="favicon" value={profile?.favicon || ""} />

                    <button
                      type="button"
                      onClick={() => faviconInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {faviconFile ? "Ganti Favicon" : "Pilih Favicon"}
                    </button>

                    {faviconFile && (
                      <p className="text-xs text-gray-500 truncate max-w-full">
                        {faviconFile.name}
                      </p>
                    )}

                    {profile?.favicon && !faviconFile && (
                      <p className="text-xs text-gray-400">
                        Favicon saat ini tersimpan
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Hero */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Banner Halaman Utama</h2>
              <p className="text-sm text-gray-500 mb-4">
                Upload gambar banner yang akan tampil di belakang slogan pada halaman utama website.
              </p>

              {/* Ukuran rekomendasi */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-5 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary-800">Rekomendasi Ukuran Gambar:</p>
                    <ul className="text-primary-700 mt-1 space-y-0.5">
                      <li>• Lebar: <strong>1920px</strong> (full HD)</li>
                      <li>• Tinggi: <strong>800px - 1080px</strong></li>
                      <li>• Rasio: <strong>16:9</strong> atau <strong>21:9</strong></li>
                      <li>• Format: <strong>JPG, PNG, WebP</strong></li>
                      <li>• Ukuran maksimal: <strong>5MB</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors">
                {/* Preview */}
                <div className="w-full max-w-lg aspect-[21/9] rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : profile?.homeBanner ? (
                    <img
                      src={profile.homeBanner}
                      alt="Current banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-400">Belum ada banner</p>
                      <p className="text-xs text-gray-300 mt-1">Upload gambar untuk halaman utama</p>
                    </div>
                  )}
                </div>

                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleBannerSelect}
                  className="hidden"
                />
                <input type="hidden" name="homeBanner" value={profile?.homeBanner || ""} />

                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {bannerFile ? "Ganti Banner" : "Pilih Gambar Banner"}
                </button>

                {bannerFile && (
                  <p className="text-xs text-gray-500 truncate max-w-full">
                    {bannerFile.name}
                  </p>
                )}

                {profile?.homeBanner && !bannerFile && (
                  <p className="text-xs text-gray-400">
                    Banner saat ini tersimpan
                  </p>
                )}
              </div>

              {/* Brightness Control */}
              <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kecerahan Gambar Background
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Atur tingkat kecerahan gambar banner. Semakin kecil nilai, semakin gelap gambarnya.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Gelap</span>
                  </div>
                  <input
                    type="range"
                    name="homeBannerBrightness"
                    min="0"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-current"
                    style={{ accentColor: primaryColor }}
                  />
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Terang</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div
                    className="w-full max-w-[200px] h-8 rounded-lg border border-gray-300 overflow-hidden"
                    style={{
                      background: "linear-gradient(to right, #000, #fff)",
                    }}
                  ></div>
                  <span className="text-sm font-mono text-gray-600 ml-3 min-w-[3rem] text-right">
                    {brightness}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "tipografi" ? (
          <div className="space-y-6">
            {/* Font & Typography Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Font & Tipografi</h2>
              <p className="text-sm text-gray-500 mb-6">
                Pilih jenis font dan ukuran teks untuk tampilan website publik.
              </p>

              {/* Font Pairings */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Font Judul (Heading)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fontOptions.map((font) => (
                      <label
                        key={font.value}
                        onClick={() => setHeadingFont(font.value)}
                        className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          headingFont === font.value
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="headingFont"
                          value={font.value}
                          checked={headingFont === font.value}
                          onChange={() => setHeadingFont(font.value)}
                          className="sr-only"
                        />
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        >
                          A
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900" style={{ fontFamily: font.value }}>
                            {font.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {font.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Font Teks (Body)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fontOptions.map((font) => (
                      <label
                        key={font.value}
                        onClick={() => setBodyFont(font.value)}
                        className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          bodyFont === font.value
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="bodyFont"
                          value={font.value}
                          checked={bodyFont === font.value}
                          onChange={() => setBodyFont(font.value)}
                          className="sr-only"
                        />
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        >
                          A
                        </div>
                        <div>
                          <p className="text-gray-900" style={{ fontFamily: font.value }}>
                            {font.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {font.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ukuran Font Dasar
                    </label>
                    <select
                      name="baseFontSize"
                      value={baseFontSize}
                      onChange={(e) => setBaseFontSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="14">14px — Kecil</option>
                      <option value="15">15px</option>
                      <option value="16">16px — Normal</option>
                      <option value="17">17px</option>
                      <option value="18">18px — Besar</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      Ukuran font dasar untuk teks body
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ketebalan Font Judul
                    </label>
                    <select
                      name="headingWeight"
                      value={headingWeight}
                      onChange={(e) => setHeadingWeight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="600">Semibold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extrabold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      Ketebalan font untuk judul dan heading
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Font Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Pratinjau Font</h2>
              <p className="text-sm text-gray-500 mb-4">
                Contoh tampilan teks dengan pengaturan font yang dipilih.
              </p>
              <div className="rounded-xl border border-gray-200 p-6 space-y-4">
                <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: headingFont, fontWeight: headingWeight }}>
                  SMA Annajah
                </p>
                <p className="text-xl font-semibold text-gray-800" style={{ fontFamily: headingFont }}>
                  Mewujudkan Generasi Berprestasi
                </p>
                <div className="h-px bg-gray-200" />
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: bodyFont, fontSize: `${baseFontSize}px` }}>
                  SMA Annajah adalah sekolah menengah atas yang berkomitmen untuk mencetak generasi unggul, berakhlak mulia, dan berprestasi di era global. Dengan tenaga pengajar profesional dan fasilitas modern, kami siap mendampingi putra-putri Anda meraih masa depan gemilang.
                </p>
                <p className="text-sm text-gray-500" style={{ fontFamily: bodyFont }}>
                  Teks kecil dengan font yang sama.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Color Theme Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Tema Warna</h2>
              <p className="text-sm text-gray-500 mb-4">
                Pilih warna utama website. Perubahan akan langsung terlihat di halaman publik.
              </p>

              {/* Live Preview */}
              <div className="mb-6 p-4 rounded-xl border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Pratinjau</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: primaryColor, opacity: 0.8 }}
                  />
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: primaryColor, opacity: 0.6 }}
                  />
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: primaryColor, opacity: 0.2 }}
                  />
                  <span className="text-sm text-gray-500 font-mono ml-2">
                    {primaryColor}
                  </span>
                </div>
              </div>

              {/* Color Presets */}
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Warna Pilihan
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => setPrimaryColor(preset.color)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      primaryColor === preset.color
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                      <p className="text-xs text-gray-500">{preset.color}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Color Picker */}
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Warna Kustom
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                      setPrimaryColor(val.length === 7 ? val : primaryColor);
                    }
                  }}
                  placeholder="#1e40af"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-32"
                />
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Pratinjau Tampilan</h2>
              <p className="text-sm text-gray-500 mb-4">
                Contoh tampilan website dengan warna yang dipilih.
              </p>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                {/* Preview Header */}
                <div
                  className="p-4 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold">A</div>
                      <span className="font-semibold text-sm">SMA Annajah</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-white/20 rounded" />
                      <div className="w-6 h-6 bg-white/20 rounded" />
                    </div>
                  </div>
                </div>
                {/* Preview Body */}
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="w-16 h-6 rounded" style={{ backgroundColor: `${primaryColor}20` }} />
                    <div className="w-20 h-6 rounded" style={{ backgroundColor: `${primaryColor}20` }} />
                    <div className="w-14 h-6 rounded" style={{ backgroundColor: `${primaryColor}20` }} />
                  </div>
                  <div className="h-3 w-3/4 rounded-full bg-gray-200" />
                  <div className="h-3 w-1/2 rounded-full bg-gray-200" />
                  <div className="flex gap-2 mt-4">
                    <button
                      className="px-4 py-2 text-white text-xs font-medium rounded-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Tombol Utama
                    </button>
                    <button
                      className="px-4 py-2 text-xs font-medium rounded-lg border-2"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      Tombol Kedua
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          {(success || uploading) && (
            <span className={`text-sm font-medium ${uploading ? "text-gray-500" : "text-green-600"}`}>
              {uploading ? "Mengupload file..." : "Pengaturan berhasil disimpan!"}
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {uploading ? "Mengupload..." : "Menyimpan..."}
              </>
            ) : (
              "Simpan Pengaturan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
