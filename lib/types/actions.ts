/**
 * Common result types for server actions
 */

export type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { error: string }

export type CreateResult = 
  | { success: true; id: string }
  | { error: string }

export type UpdateResult = 
  | { success: true }
  | { error: string }

export type DeleteResult = 
  | { success: true }
  | { error: string }

// Specific result types for common patterns
export type CreateSnippetResult = 
  | { success: true; snippetId: string }
  | { error: string }

export type CreateCollectionResult = 
  | { success: true; collectionId: string }
  | { error: string }

