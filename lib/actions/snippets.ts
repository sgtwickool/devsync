"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { handleServerActionError } from "@/lib/utils/errors"
import type { CreateSnippetResult, UpdateResult, DeleteResult } from "@/lib/types/actions"

const createSnippetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
})

const updateSnippetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
})

export async function createSnippet(formData: FormData): Promise<CreateSnippetResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      code: formData.get("code"),
      language: formData.get("language"),
    }

    // Validate all required fields are strings
    if (
      typeof rawData.title !== "string" ||
      typeof rawData.code !== "string" ||
      typeof rawData.language !== "string"
    ) {
      return { error: "Title, code, and language are required" }
    }

    const validated = createSnippetSchema.parse({
      title: rawData.title,
      description: typeof rawData.description === "string" ? rawData.description : undefined,
      code: rawData.code,
      language: rawData.language,
    })

    // Create snippet
    const snippet = await prisma.snippet.create({
      data: {
        title: validated.title,
        description: validated.description || null,
        code: validated.code,
        language: validated.language,
        userId: session.user.id,
      },
    })

    revalidatePath("/dashboard")
    return { success: true, snippetId: snippet.id }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

export async function deleteSnippet(snippetId: string): Promise<DeleteResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Verify snippet belongs to user
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: { userId: true },
    })

    if (!snippet) {
      return { error: "Snippet not found" }
    }

    if (snippet.userId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    await prisma.snippet.delete({
      where: { id: snippetId },
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

export async function updateSnippet(snippetId: string, formData: FormData): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Verify snippet belongs to user
    const existingSnippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: { userId: true },
    })

    if (!existingSnippet) {
      return { error: "Snippet not found" }
    }

    if (existingSnippet.userId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      code: formData.get("code"),
      language: formData.get("language"),
    }

    // Validate all required fields are strings
    if (
      typeof rawData.title !== "string" ||
      typeof rawData.code !== "string" ||
      typeof rawData.language !== "string"
    ) {
      return { error: "Title, code, and language are required" }
    }

    const validated = updateSnippetSchema.parse({
      title: rawData.title,
      description: typeof rawData.description === "string" ? rawData.description : undefined,
      code: rawData.code,
      language: rawData.language,
    })

    await prisma.snippet.update({
      where: { id: snippetId },
      data: {
        title: validated.title,
        description: validated.description || null,
        code: validated.code,
        language: validated.language,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/snippets/${snippetId}`)
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

