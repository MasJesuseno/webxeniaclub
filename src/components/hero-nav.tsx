"use client";

import { useState } from "react";
import Link from "next/link";

type HeroNavProps = {
  logo: string | null | undefined;
  schoolName: string;
  slogan?: string | null;
  ppdbUrl?: string;
};

const menuItems = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/berita", label: "Berita" },
  { href: "/galeri", label: "Galeri" },
  { href: "/kontak", label: "Kontak" },
];

export function HeroNav({ logo, schoolName, slogan, ppdbUrl }: HeroNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative bg-primary-100 border-b border-primary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt={schoolName}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {schoolName.charAt(0)}
              </div>
            )}
            <div>
              <span className="font-bold text-primary-900 text-lg leading-tight">
                {schoolName}
              </span>
              {slogan && (
                <p className="text-xs text-primary-600/70 leading-tight mt-0.5">
                  {slogan}
                </p>
              )}
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-200 rounded-lg transition-all"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={ppdbUrl || "https://sas.smaannajah.sch.id/ppdb"}
              className="ml-3 px-6 py-2.5 bg-primary-900 text-white text-base font-bold rounded-lg hover:bg-primary-800 transition-all shadow-md"
            >
              Daftar Sekarang
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-primary-700 hover:text-primary-900 hover:bg-primary-200 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-primary-200 pt-4">
            <div className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-200 rounded-lg transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={ppdbUrl || "https://sas.smaannajah.sch.id/ppdb"}
                className="mt-2 block px-5 py-3 text-base font-bold bg-primary-900 text-white rounded-lg text-center hover:bg-primary-800 transition-all shadow-md"
                onClick={() => setMobileOpen(false)}
              >
                Daftar Sekarang
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
