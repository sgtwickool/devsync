"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { handleServerActionError } from "@/lib/utils/errors"
import { parseTagsFromFormData, getOrCreateTag } from "@/lib/utils/tags"
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
      tags: formData.get("tags"),
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

    // Parse and create tags
    const tagNames = parseTagsFromFormData(rawData.tags)
    const snippet = await prisma.snippet.create({
      data: {
        title: validated.title,
        description: validated.description || null,
        code: validated.code,
        language: validated.language,
        userId: session.user.id,
        tags: {
          create: await Promise.all(
            tagNames.map(async (tagName) => {
              const tag = await getOrCreateTag(prisma, tagName)
              return { tagId: tag.id }
            })
          ),
        },
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
      tags: formData.get("tags"),
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

    // Parse tags and get current tags
    const tagNames = parseTagsFromFormData(rawData.tags)
    const currentSnippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      include: { tags: { include: { tag: true } } },
    })

    const currentTagNames = currentSnippet?.tags.map((st) => st.tag.name) || []
    const tagsToAdd = tagNames.filter((t) => !currentTagNames.includes(t))
    const tagsToRemove = currentTagNames.filter((t) => !tagNames.includes(t))

    // Update snippet
    await prisma.snippet.update({
      where: { id: snippetId },
      data: {
        title: validated.title,
        description: validated.description || null,
        code: validated.code,
        language: validated.language,
      },
    })

    // Add new tags
    await Promise.all(
      tagsToAdd.map(async (tagName) => {
        const tag = await getOrCreateTag(prisma, tagName)
        await prisma.snippetTag.create({
          data: { snippetId, tagId: tag.id },
        })
      })
    )

    // Remove tags
    await Promise.all(
      tagsToRemove.map(async (tagName) => {
        const tag = await prisma.tag.findUnique({ where: { name: tagName } })
        if (tag) {
          await prisma.snippetTag.delete({
            where: { snippetId_tagId: { snippetId, tagId: tag.id } },
          })
        }
      })
    )

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/snippets/${snippetId}`)
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

