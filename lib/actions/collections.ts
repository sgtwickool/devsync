"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { handleServerActionError } from "@/lib/utils/errors"

const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

type CreateCollectionResult = 
  | { success: true; collectionId: string }
  | { error: string }

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

type UpdateCollectionResult = 
  | { success: true }
  | { error: string }

export async function updateCollection(collectionId: string, formData: FormData): Promise<UpdateCollectionResult> {
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

type DeleteCollectionResult = 
  | { success: true }
  | { error: string }

export async function deleteCollection(collectionId: string): Promise<DeleteCollectionResult> {
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

type AddSnippetToCollectionResult = 
  | { success: true }
  | { error: string }

export async function addSnippetToCollection(collectionId: string, snippetId: string): Promise<AddSnippetToCollectionResult> {
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

    await prisma.snippetCollection.create({
      data: {
        snippetId,
        collectionId,
      },
    })

    revalidatePath(`/dashboard/collections/${collectionId}`)
    revalidatePath(`/dashboard/snippets/${snippetId}`)
    return { success: true }
  } catch (error) {
    return { error: handleServerActionError(error) }
  }
}

type RemoveSnippetFromCollectionResult = 
  | { success: true }
  | { error: string }

export async function removeSnippetFromCollection(collectionId: string, snippetId: string): Promise<RemoveSnippetFromCollectionResult> {
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

