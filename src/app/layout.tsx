import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { prisma } from "@/lib/prisma"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export async function generateMetadata(): Promise<Metadata> {
  let iconUrl: string | undefined

  try {
    const profile = await prisma.siteProfile.findFirst()
    if (profile?.favicon) {
      iconUrl = profile.favicon
    } else if (profile?.logo) {
      iconUrl = profile.logo
    }
  } catch {
    // fallback — biarkan browser menggunakan default
  }

  return {
    title: "DXIC - Xenia Club Indonesia",
    description: "Komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia. Xenia Menyatukan Kita.",
    icons: iconUrl ? { icon: iconUrl, apple: iconUrl } : undefined,
  }
}

export const revalidate = 0

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
