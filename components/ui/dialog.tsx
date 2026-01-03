"use client"

import { useEffect, useState, ReactNode } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

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
}

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

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

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
        className={`bg-card border border-border rounded-xl shadow-lg ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] flex flex-col animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {headerIcon && <div className="p-2 bg-primary/10 rounded-lg">{headerIcon}</div>}
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none p-1"
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
          <div className="p-6 border-t border-border flex-shrink-0 bg-card">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

