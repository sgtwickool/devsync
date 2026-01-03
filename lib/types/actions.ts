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

