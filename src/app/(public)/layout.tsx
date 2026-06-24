import { HeroNav } from "@/components/hero-nav"
import { Footer } from "@/components/footer"
import { ColorTheme } from "@/components/color-theme"
import { prisma } from "@/lib/prisma"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [profile, headerMenu] = await Promise.all([
    prisma.siteProfile.findFirst() as any,
    prisma.menu.findUnique({
      where: { location: "header" },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { order: "asc" },
          include: {
            page: { select: { title: true, slug: true } },
            children: {
              orderBy: { order: "asc" },
              include: { page: { select: { title: true, slug: true } } },
            },
          },
        },
      },
    }),
  ])

  return (
    <>
      <ColorTheme primaryColor={profile?.primaryColor || "#DC2626"} />
      <HeroNav
        clubName={profile?.clubName || "Xenia Club Indonesia"}
        shortName={profile?.shortName || "DXIC"}
        logo={profile?.logo}
        primaryColor={profile?.primaryColor}
        slogan={profile?.slogan}
        menuItems={(headerMenu?.items as any[]) || []}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer
        clubName={profile?.clubName}
        shortName={profile?.shortName}
        description={profile?.description}
        address={profile?.address}
        phone={profile?.phone}
        email={profile?.email}
        instagramUrl={profile?.instagramUrl}
        youtubeUrl={profile?.youtubeUrl}
        facebookUrl={profile?.facebookUrl}
        twitterUrl={profile?.twitterUrl}
      />
    </>
  )
}
