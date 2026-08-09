import { prisma } from "../src/lib/prisma";

async function main() {
  const members = await prisma.prospectiveMember.findMany({
    where: {
      masaBerlaku: { not: null },
      OR: [
        { status: "Diterima" },
        { statusMember: "Aktif" },
      ],
    },
    select: { memberId: true, namaLengkap: true, masaBerlaku: true },
    take: 10,
  });

  if (members.length === 0) {
    console.log("No members with masaBerlaku found locally.");
    console.log("Checking all accepted members...");
    const allMembers = await prisma.prospectiveMember.findMany({
      where: {
        OR: [
          { status: "Diterima" },
          { statusMember: "Aktif" },
        ],
      },
      select: { memberId: true, namaLengkap: true, masaBerlaku: true },
      take: 10,
    });
    console.log(JSON.stringify(allMembers, null, 2));
  } else {
    console.log(JSON.stringify(members, null, 2));
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
