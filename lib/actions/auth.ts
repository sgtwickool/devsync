"use server"

import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
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
        email: validated.email,
        password: hashedPassword,
      },
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message ?? "Validation failed" }
    }
    
    // Log unexpected errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("Registration error:", error)
    }
    
    return { error: "Something went wrong. Please try again." }
  }
}
