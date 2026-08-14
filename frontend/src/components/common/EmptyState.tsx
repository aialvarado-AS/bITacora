// ============================================================================
// bITacora — Estado vacío genérico (sin resultados, sin datos, etc.)
// ============================================================================

import type { ReactNode } from 'react'

export type EmptyStateProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {Icon && (
        <span className="empty-state__icon" aria-hidden="true">
          <Icon size={32} strokeWidth={1.5} />
        </span>
      )}
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
