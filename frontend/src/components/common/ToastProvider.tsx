// ============================================================================
// bITacora — Proveedor de notificaciones toast (Radix Toast)
// ============================================================================

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import * as Toast from '@radix-ui/react-toast'

export type ToastVariant = 'default' | 'success' | 'error'

type ToastItem = {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
}

type ToastContextValue = {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback((input: ToastInput) => {
    const id = nextId++
    setItems((current) => [...current, { id, variant: 'default', ...input }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="right" duration={4500}>
        {children}
        {items.map((item) => (
          <Toast.Root
            key={item.id}
            className={`toast toast--${item.variant} glass-card`}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id)
            }}
          >
            <Toast.Title className="toast__title">{item.title}</Toast.Title>
            {item.description && (
              <Toast.Description className="toast__description">
                {item.description}
              </Toast.Description>
            )}
            <Toast.Close className="toast__close" aria-label="Cerrar">
              ×
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="toast__viewport" />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>')
  }
  return context
}
