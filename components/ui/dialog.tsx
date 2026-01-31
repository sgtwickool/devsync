"use client"

import { useEffect, useState, useRef, useCallback, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl"
  showCloseButton?: boolean
  headerIcon?: ReactNode
  footer?: ReactNode
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
} as const satisfies Record<NonNullable<DialogProps["maxWidth"]>, string>

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "2xl",
  showCloseButton = true,
  headerIcon,
  footer,
}: DialogProps) {
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }

      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    },
    [onClose]
  )

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      // Store current active element to restore focus later
      previousActiveElement.current = document.activeElement

      document.body.style.overflow = "hidden"
      document.addEventListener("keydown", handleKeyDown)

      // Focus first focusable element in dialog
      requestAnimationFrame(() => {
        const focusable = dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        focusable?.focus()
      })

      return () => {
        document.body.style.overflow = "unset"
        document.removeEventListener("keydown", handleKeyDown)
        // Restore focus to previously focused element
        ;(previousActiveElement.current as HTMLElement)?.focus?.()
      }
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={cn(
          "bg-card border border-border rounded-xl shadow-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in",
          maxWidthClasses[maxWidth ?? "2xl"]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {headerIcon && <div className="p-2 bg-primary/10 rounded-lg">{headerIcon}</div>}
            <h2 id="dialog-title" className="text-2xl font-bold text-foreground">{title}</h2>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t border-border flex-shrink-0 bg-card rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

