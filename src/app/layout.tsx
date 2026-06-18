import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ColorThemeScript } from "@/components/color-theme";
import { FontStyleScript } from "@/components/font-style";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.siteProfile.findFirst({ where: { id: 1 } });

  return {
    title: {
      default: profile?.schoolName || "SMA Annajah - Website Resmi",
      template: `%s | ${profile?.shortName || "SMA Annajah"}`,
    },
    description:
      profile?.description || "Website resmi SMA Annajah. Informasi tentang sekolah, berita terbaru, galeri kegiatan, dan profil sekolah.",
    icons: {
      icon: profile?.favicon || undefined,
      shortcut: profile?.favicon || undefined,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 400,
        }}
      >
        <ColorThemeScript />
        <FontStyleScript />
        {children}
      </body>
    </html>
  );
}
