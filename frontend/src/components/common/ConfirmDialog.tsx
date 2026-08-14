// ============================================================================
// bITacora — Diálogo de confirmación genérico (basado en Radix Dialog)
// ============================================================================

import * as Dialog from '@radix-ui/react-dialog'

export type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  isLoading?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="confirm-dialog__overlay" />
        <Dialog.Content className="confirm-dialog__content glass-strong">
          <Dialog.Title className="confirm-dialog__title">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="confirm-dialog__description">
              {description}
            </Dialog.Description>
          )}
          <div className="confirm-dialog__actions">
            <Dialog.Close asChild>
              <button type="button" className="btn btn--ghost" disabled={isLoading}>
                {cancelLabel}
              </button>
            </Dialog.Close>
            <button
              type="button"
              className={destructive ? 'btn btn--danger' : 'btn btn--primary'}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Procesando…' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
