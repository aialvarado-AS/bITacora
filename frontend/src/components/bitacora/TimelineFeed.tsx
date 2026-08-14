// ============================================================================
// bITacora — Feed cronológico de la Bitácora (con paginación "Cargar más")
// ============================================================================

import { History } from 'lucide-react'
import { EmptyState } from '../common/EmptyState'
import { TimelineItem } from './TimelineItem'
import type { RegistroActividad } from '../../api/bitacora'

export type TimelineFeedProps = {
  registros: RegistroActividad[]
  isLoading?: boolean
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  onLoadMore?: () => void
  totalCount?: number
}

export function TimelineFeed({
  registros,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  totalCount,
}: TimelineFeedProps) {
  if (isLoading) {
    return (
      <div className="timeline-feed">
        <ul className="timeline-feed__list">
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={`skeleton-${index}`} className="timeline-item">
              <span className="timeline-item__icon timeline-item__icon--auto" aria-hidden="true" />
              <div className="timeline-item__body glass-card stack gap-sm">
                <span className="skeleton-line" style={{ width: '40%' }} />
                <span className="skeleton-line" style={{ width: '85%' }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (registros.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Sin actividad"
        description="No hay registros que coincidan con los filtros actuales."
      />
    )
  }

  return (
    <div className="timeline-feed">
      {typeof totalCount === 'number' && (
        <p className="timeline-feed__count text-3">
          {totalCount} registro{totalCount === 1 ? '' : 's'}
        </p>
      )}

      <ul className="timeline-feed__list">
        {registros.map((registro) => (
          <TimelineItem key={registro.id} registro={registro} />
        ))}
      </ul>

      {hasNextPage && (
        <div className="timeline-feed__footer">
          <button type="button" className="btn btn--ghost" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  )
}
