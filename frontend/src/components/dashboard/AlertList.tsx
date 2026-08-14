// ============================================================================
// bITacora — Dashboard: "Mis pendientes" ordenados por urgencia
// ============================================================================

import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { SemaforoIndicator } from '../common/SemaforoIndicator'
import { StatusBadge } from '../common/StatusBadge'
import { EmptyState } from '../common/EmptyState'
import { formatFecha } from '../../lib/formatters'
import { MODULO_META } from './ModuleSummaryCard'
import type { PendienteItem } from '../../api/dashboard'
import type { Semaforo } from '../../types/common'

export type AlertListProps = {
  items: PendienteItem[]
  isLoading?: boolean
}

// rojo (vencido) primero, luego amarillo (por vencer), verde, gris (cerrado).
const URGENCIA_RANK: Record<Semaforo, number> = {
  rojo: 0,
  amarillo: 1,
  verde: 2,
  gris: 3,
}

function ordenarPorUrgencia(items: PendienteItem[]): PendienteItem[] {
  return [...items].sort((a, b) => {
    const diff = URGENCIA_RANK[a.semaforo] - URGENCIA_RANK[b.semaforo]
    if (diff !== 0) return diff
    return a.fecha_plazo_maximo.localeCompare(b.fecha_plazo_maximo)
  })
}

export function AlertList({ items, isLoading = false }: AlertListProps) {
  if (isLoading) {
    return (
      <div className="alert-list glass-card stack gap-sm">
        <span className="skeleton-line" style={{ width: '40%' }} />
        {Array.from({ length: 3 }).map((_, index) => (
          <span key={index} className="skeleton-line" />
        ))}
      </div>
    )
  }

  const ordenados = ordenarPorUrgencia(items)

  return (
    <div className="alert-list glass-card">
      <h3 className="alert-list__title">Mis pendientes</h3>

      {ordenados.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Sin pendientes"
          description="No tienes items asignados con plazo activo."
        />
      ) : (
        <ul className="alert-list__items">
          {ordenados.map((item) => {
            const meta = MODULO_META[item.modulo]
            const to = meta ? `${meta.to}/${item.id}` : '#'
            return (
              <li key={`${item.modulo}-${item.id}`} className="alert-list__item">
                <SemaforoIndicator semaforo={item.semaforo} />
                <div className="alert-list__item-body">
                  <Link to={to} className="alert-list__item-title">
                    {item.titulo}
                  </Link>
                  <div className="alert-list__item-meta">
                    <span className="alert-list__item-modulo">{meta?.label ?? item.modulo}</span>
                    <StatusBadge estado={item.estado} />
                    <span className="text-3">Plazo: {formatFecha(item.fecha_plazo_maximo)}</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
