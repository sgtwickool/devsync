"use server"

import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { handleServerActionError } from "@/lib/utils/errors"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type RegisterResult = 
  | { success: true }
  | { error: string }

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    }

    // Validate all fields are strings
    if (
      typeof rawData.name !== "string" ||
      typeof rawData.email !== "string" ||
      typeof rawData.password !== "string"
    ) {
      return { error: "All fields are required" }
    }

    const validated = registerSchema.parse(rawData)

    // Normalize email to lowercase for consistency
    const normalizedEmail = validated.email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Hash password
    const hashedPassword = await hash(validated.password, 12)

    // Create user
    await prisma.user.create({
      data: {
        name: validated.name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    })

    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}
