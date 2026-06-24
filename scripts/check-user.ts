const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true, email: true, isActive: true },
  })
  console.log("Users found:", users.length)
  for (const u of users) {
    console.log("  - name:", u.name, "| username:", u.username, "| email:", u.email, "| active:", u.isActive)
  }
  await prisma.$disconnect()
}

main().catch(e => {
  console.error("Error:", e.message)
  process.exit(1)
})
