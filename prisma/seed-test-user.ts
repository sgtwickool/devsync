import { prisma } from "../lib/prisma"
import { hash } from "bcryptjs"

async function main() {
  const email = "test@example.com"
  const password = "password123"
  const name = "Test User"

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log(`User ${email} already exists`)
    return
  }

  // Hash password with same cost factor as auth.ts
  const hashedPassword = await hash(password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  })

  console.log(`Created test user: ${user.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
