import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.partner.count()
  console.log("Partner count:", count)
  const partners = await prisma.partner.findMany()
  console.log("Partners:", JSON.stringify(partners, null, 2))
  await prisma.$disconnect()
}

main()
