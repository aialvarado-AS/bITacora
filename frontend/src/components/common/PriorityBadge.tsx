// ============================================================================
// bITacora — Badge de prioridad de un item de seguimiento
// ============================================================================

import type { Prioridad } from '../../types/common'
import { PRIORIDADES } from '../../types/common'

const PRIORIDAD_LABELS: Record<Prioridad, string> = Object.fromEntries(
  PRIORIDADES.map((prioridad) => [prioridad.value, prioridad.label]),
) as Record<Prioridad, string>

// BAJA/MEDIA usan texto de color normal sobre fondo sutil; ALTA/URGENTE usan
// fondo naranja/rojo sólido con texto claro (el naranja nunca es color de texto).
function getStyle(prioridad: Prioridad): { color: string; background: string } {
  switch (prioridad) {
    case 'BAJA':
      return { color: 'var(--prio-baja)', background: 'transparent' }
    case 'MEDIA':
      return { color: 'var(--prio-media)', background: 'transparent' }
    case 'ALTA':
      return { color: 'var(--text-on-brand)', background: 'var(--prio-alta-bg)' }
    case 'URGENTE':
      return { color: 'var(--text-on-brand)', background: 'var(--prio-urgente-bg)' }
  }
}

export type PriorityBadgeProps = {
  prioridad: Prioridad
}

export function PriorityBadge({ prioridad }: PriorityBadgeProps) {
  const style = getStyle(prioridad)
  return (
    <span
      className="priority-badge"
      style={{
        color: style.color,
        backgroundColor: style.background,
        borderColor: style.background === 'transparent' ? 'var(--border-1)' : 'transparent',
      }}
    >
      {PRIORIDAD_LABELS[prioridad]}
    </span>
  )
}
