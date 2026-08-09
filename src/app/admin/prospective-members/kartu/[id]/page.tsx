import { getProspectiveMemberById } from "@/lib/actions"
import { getSiteProfile } from "@/lib/actions"
import { notFound } from "next/navigation"
import { MemberCard } from "@/components/member-card"

export default async function MemberCardPage({
  params,
}: {
  params: { id: string }
}) {
  const member = await getProspectiveMemberById(params.id)
  if (!member) notFound()

  const profile = await getSiteProfile()

  const baseUrl = process.env.NEXTAUTH_URL || "http://192.168.1.53"
  const profileUrl = member.memberId ? `${baseUrl}/p/${member.memberId}` : null

  return (
    <MemberCard
      member={{
        namaPanggilan: member.namaPanggilan,
        namaLengkap: member.namaLengkap,
        foto: member.foto,
        memberId: member.memberId,
        masaBerlaku: member.masaBerlaku?.toISOString() || null,
      }}
      clubName={profile.clubName}
      shortName={profile.shortName}
      logo={profile.logo}
      favicon={profile.favicon}
      cardTemplateFront={profile.cardTemplateFront}
      cardTemplateBack={profile.cardTemplateBack}
      slogan={profile.slogan}
      profileUrl={profileUrl}
      autoPrint
    />
  )
}
