import { prisma } from "@/lib/prisma";
import { Footer } from "@/components/footer";
import { HeroNav } from "@/components/hero-nav";

async function getPublicData() {
  const profile = await prisma.siteProfile.findFirst({ where: { id: 1 } });
  return { profile };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getPublicData();
  const schoolName = profile?.shortName || "SMA Annajah";

  return (
    <>
      <HeroNav
        logo={profile?.logo}
        schoolName={schoolName}
        slogan={profile?.slogan}
      />
      <main>{children}</main>
      <Footer />
    </>
  );
}


