"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { handleServerActionError } from "@/lib/utils/errors"
import type { CreateCollectionResult, UpdateResult, DeleteResult } from "@/lib/types/actions"

const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
}) satisfies z.ZodType<{
  name: string
  description?: string
}>

export async function createCollection(formData: FormData): Promise<CreateCollectionResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
    }

    if (typeof rawData.name !== "string") {
      return { error: "Name is required" }
    }

    const validated = createCollectionSchema.parse({
      name: rawData.name,
      description: typeof rawData.description === "string" ? rawData.description : undefined,
    })

    const collection = await prisma.collection.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        userId: session.user.id,
      },
    })

    revalidatePath("/dashboard/collections")
    return { success: true, collectionId: collection.id }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

export async function updateCollection(collectionId: string, formData: FormData): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const existingCollection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    })

    if (!existingCollection) {
      return { error: "Collection not found" }
    }

    if (existingCollection.userId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
    }

    if (typeof rawData.name !== "string") {
      return { error: "Name is required" }
    }

    const validated = createCollectionSchema.parse({
      name: rawData.name,
      description: typeof rawData.description === "string" ? rawData.description : undefined,
    })

    await prisma.collection.update({
      where: { id: collectionId },
      data: {
        name: validated.name,
        description: validated.description || null,
      },
    })

    revalidatePath("/dashboard/collections")
    revalidatePath(`/dashboard/collections/${collectionId}`)
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

export async function deleteCollection(collectionId: string): Promise<DeleteResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    })

    if (!collection) {
      return { error: "Collection not found" }
    }

    if (collection.userId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    await prisma.collection.delete({
      where: { id: collectionId },
    })

    revalidatePath("/dashboard/collections")
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

export async function addSnippetToCollection(collectionId: string, snippetId: string): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Verify collection belongs to user
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    })

    if (!collection || collection.userId !== session.user.id) {
      return { error: "Collection not found or unauthorized" }
    }

    // Verify snippet belongs to user
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: { userId: true },
    })

    if (!snippet || snippet.userId !== session.user.id) {
      return { error: "Snippet not found or unauthorized" }
    }

    // Check if already in collection
    const existing = await prisma.snippetCollection.findUnique({
      where: {
        snippetId_collectionId: {
          snippetId,
          collectionId,
        },
      },
    })

    if (existing) {
      return { error: "Snippet is already in this collection" }
    }

    // Get the max order value for this collection to append at the end
    const maxOrder = await prisma.snippetCollection.findFirst({
      where: { collectionId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = maxOrder ? maxOrder.order + 1 : 0

    await prisma.snippetCollection.create({
      data: {
        snippetId,
        collectionId,
        order: newOrder,
      },
    })

    revalidatePath(`/dashboard/collections/${collectionId}`)
    revalidatePath(`/dashboard/snippets/${snippetId}`)
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

export async function reorderSnippetInCollection(
  collectionId: string,
  snippetId: string,
  direction: "up" | "down"
): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Verify collection belongs to user
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    })

    if (!collection || collection.userId !== session.user.id) {
      return { error: "Collection not found or unauthorized" }
    }

    // Get all snippets in collection ordered by order, then addedAt as fallback
    const allSnippets = await prisma.snippetCollection.findMany({
      where: { collectionId },
      orderBy: [
        { order: "asc" },
        { addedAt: "asc" },
      ],
      select: { snippetId: true, order: true },
    })

    const currentIndex = allSnippets.findIndex((sc) => sc.snippetId === snippetId)
    
    if (currentIndex === -1) {
      return { error: "Snippet not found in collection" }
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= allSnippets.length) {
      return { error: "Cannot move snippet in that direction" }
    }

    // Reorder all snippets by reassigning order values sequentially
    // This ensures clean ordering without gaps
    const updates = allSnippets.map((sc, index) => {
      let newOrder = index
      
      // Swap the two items
      if (index === currentIndex) {
        newOrder = newIndex
      } else if (index === newIndex) {
        newOrder = currentIndex
      }

      return prisma.snippetCollection.update({
        where: {
          snippetId_collectionId: {
            snippetId: sc.snippetId,
            collectionId,
          },
        },
        data: { order: newOrder },
      })
    })

    await prisma.$transaction(updates)

    revalidatePath(`/dashboard/collections/${collectionId}`)
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

export async function removeSnippetFromCollection(collectionId: string, snippetId: string): Promise<UpdateResult> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    // Verify collection belongs to user
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    })

    if (!collection || collection.userId !== session.user.id) {
      return { error: "Collection not found or unauthorized" }
    }

    await prisma.snippetCollection.delete({
      where: {
        snippetId_collectionId: {
          snippetId,
          collectionId,
        },
      },
    })

    revalidatePath(`/dashboard/collections/${collectionId}`)
    revalidatePath(`/dashboard/snippets/${snippetId}`)
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

