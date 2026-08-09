import { MemberBottomNav } from "@/components/member-bottom-nav"
import { ColorTheme } from "@/components/color-theme"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await prisma.siteProfile.findFirst() as any

  return (
    <>
      <ColorTheme primaryColor={profile?.primaryColor || "#DC2626"} />
      <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative pb-20">
        {/* Status Bar */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm no-print">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-xs font-bold">
              {profile?.shortName?.charAt(0) || "D"}
            </div>
            <span className="font-semibold text-sm">Member Area</span>
          </div>
          <div className="text-[10px] text-white/70">
            {profile?.shortName || "DXIC"}
          </div>
        </div>

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
