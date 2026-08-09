import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Mengupdate status semua member menjadi Diterima...")
  
  const result = await prisma.prospectiveMember.updateMany({
    data: { status: "Diterima" },
  })

  console.log(`✅ ${result.count} member berhasil diupdate statusnya menjadi "Diterima"`)
  
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
