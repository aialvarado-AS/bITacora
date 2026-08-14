// ============================================================================
// bITacora — Lista de tarjetas genérica (vista mobile/tablet, quiebre 860px)
// ============================================================================

import type { ReactNode } from 'react'
import { EmptyState } from './EmptyState'

export type CardListProps<T> = {
  items: T[]
  getKey: (item: T) => string | number
  renderItem: (item: T) => ReactNode
  onItemClick?: (item: T) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function CardList<T>({
  items,
  getKey,
  renderItem,
  onItemClick,
  isLoading = false,
  emptyTitle = 'Sin resultados',
  emptyDescription = 'No hay elementos que coincidan con los filtros actuales.',
}: CardListProps<T>) {
  if (isLoading) {
    return (
      <div className="card-list">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="card-list__item glass-card card-list__item--skeleton">
            <span className="skeleton-line" />
            <span className="skeleton-line" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="card-list">
      {items.map((item) => {
        const key = getKey(item)
        return (
          <div
            key={key}
            className={onItemClick ? 'card-list__item glass-card card-list__item--clickable' : 'card-list__item glass-card'}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
            role={onItemClick ? 'button' : undefined}
            tabIndex={onItemClick ? 0 : undefined}
            onKeyDown={
              onItemClick
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onItemClick(item)
                    }
                  }
                : undefined
            }
          >
            {renderItem(item)}
          </div>
        )
      })}
    </div>
  )
}
