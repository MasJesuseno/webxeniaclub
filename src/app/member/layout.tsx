import { MemberBottomNav } from "@/components/member-bottom-nav"
import { MemberTopBar } from "@/components/member-top-bar"
import { ColorTheme } from "@/components/color-theme"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await prisma.siteProfile.findFirst() as any
  const sosOpenCount = await prisma.sosMessage.count({ where: { status: "Open" } })

  return (
    <>
      <ColorTheme primaryColor={profile?.primaryColor || "#DC2626"} />
      <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative pb-20">
        <MemberTopBar shortName={profile?.shortName || "DXIC"} sosOpenCount={sosOpenCount} />

        {/* Main Content */}
        <main className="p-4">
          {children}
        </main>

        {/* Bottom Navigation */}
        <MemberBottomNav />
      </div>
    </>
  )
}
