import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export function generateMetadata(): Metadata {
  return {
    title: "DXIC - Xenia Club Indonesia",
    description: "Komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia. Xenia Menyatukan Kita.",
    icons: [
      { rel: "icon", url: "/icon-serve" },
      { rel: "apple-touch-icon", url: "/icon-serve" },
    ],
  }
}

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
