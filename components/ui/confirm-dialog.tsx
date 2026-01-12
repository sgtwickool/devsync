"use client"

import { Dialog } from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  function handleConfirm() {
    onConfirm()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      showCloseButton={!isLoading}
      headerIcon={
        variant === "destructive" ? (
          <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden="true" />
        ) : undefined
      }
      footer={
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-foreground bg-card border border-border rounded-lg font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 transition-all"
          >
            {cancelText}
          </button>
          <LoadingButton
            onClick={handleConfirm}
            isLoading={isLoading}
            variant={variant === "destructive" ? "destructive" : "primary"}
          >
            {confirmText}
          </LoadingButton>
        </div>
      }
    >
      <p className="text-muted-foreground">{description}</p>
    </Dialog>
  )
}
