// ============================================================================
// bITacora — Panel lateral deslizante (pantalla completa en mobile,
// panel fijo 420–480px en >=768px)
// ============================================================================

import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

export type SlideOverPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function SlideOverPanel({ open, onOpenChange, title, children, footer }: SlideOverPanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="slide-over__overlay" />
        <Dialog.Content className="slide-over__content glass-strong">
          <header className="slide-over__header">
            <Dialog.Title className="slide-over__title">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="icon-btn" aria-label="Cerrar">
                <X size={18} />
              </button>
            </Dialog.Close>
          </header>
          <div className="slide-over__body">{children}</div>
          {footer && <footer className="slide-over__footer">{footer}</footer>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
