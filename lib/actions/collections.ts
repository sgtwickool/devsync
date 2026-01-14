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
      organizationId: formData.get("organizationId"),
    }

    if (typeof rawData.name !== "string") {
      return { error: "Name is required" }
    }

    const validated = createCollectionSchema.parse({
      name: rawData.name,
      description: typeof rawData.description === "string" ? rawData.description : undefined,
    })

    // Handle organization
    const organizationId =
      typeof rawData.organizationId === "string" && rawData.organizationId !== ""
        ? rawData.organizationId
        : null

    // If organization is provided, verify user is a member
    if (organizationId) {
      const isMember = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId,
          },
        },
      })

      if (!isMember) {
        return { error: "You are not a member of this organization" }
      }
    }

    const collection = await prisma.collection.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        userId: session.user.id,
        organizationId,
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
      include: {
        organization: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!existingCollection) {
      return { error: "Collection not found" }
    }

    // Check access: personal collection (userId match) or org collection (user is member)
    const hasAccess =
      existingCollection.userId === session.user.id ||
      (existingCollection.organizationId && existingCollection.organization?.members.length > 0)

    if (!hasAccess) {
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
      include: {
        organization: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!collection) {
      return { error: "Collection not found" }
    }

    // Check access: personal collection (userId match) or org collection (user is member)
    const hasAccess =
      collection.userId === session.user.id ||
      (collection.organizationId && collection.organization?.members.length > 0)

    if (!hasAccess) {
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

    // Verify collection exists and user has access
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!collection) {
      return { error: "Collection not found" }
    }

    // Check access: personal collection (userId match) or org collection (user is member)
    const hasAccess =
      collection.userId === session.user.id ||
      (collection.organizationId && collection.organization?.members.length > 0)

    if (!hasAccess) {
      return { error: "Unauthorized" }
    }

    // Verify snippet exists and user has access
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!snippet) {
      return { error: "Snippet not found" }
    }

    // Check access and context match
    const hasSnippetAccess =
      snippet.userId === session.user.id ||
      (snippet.organizationId && snippet.organization?.members.length > 0)

    if (!hasSnippetAccess) {
      return { error: "Snippet not found or unauthorized" }
    }

    // Verify snippet and collection are in the same context
    if (snippet.organizationId !== collection.organizationId) {
      return {
        error: "Cannot add organization snippet to personal collection (or vice versa)",
      }
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

    // Verify collection exists and user has access
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!collection) {
      return { error: "Collection not found" }
    }

    // Check access: personal collection (userId match) or org collection (user is member)
    const hasAccess =
      collection.userId === session.user.id ||
      (collection.organizationId && collection.organization?.members.length > 0)

    if (!hasAccess) {
      return { error: "Unauthorized" }
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

    // Verify collection exists and user has access
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!collection) {
      return { error: "Collection not found" }
    }

    // Check access: personal collection (userId match) or org collection (user is member)
    const hasAccess =
      collection.userId === session.user.id ||
      (collection.organizationId && collection.organization?.members.length > 0)

    if (!hasAccess) {
      return { error: "Unauthorized" }
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

