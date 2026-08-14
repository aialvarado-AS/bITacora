// ============================================================================
// bITacora — Badge de estado de un item de seguimiento
// ============================================================================

import type { Estado } from '../../types/common'
import { ESTADOS } from '../../types/common'

const ESTADO_STYLE: Record<Estado, { fg: string; bg: string }> = {
  PENDIENTE: { fg: 'var(--state-pendiente)', bg: 'var(--state-pendiente-bg)' },
  EN_PROCESO: { fg: 'var(--state-en-curso)', bg: 'var(--state-en-curso-bg)' },
  EN_ESPERA: { fg: 'var(--state-en-espera)', bg: 'var(--state-en-espera-bg)' },
  COMPLETADO: { fg: 'var(--state-completado)', bg: 'var(--state-completado-bg)' },
  CANCELADO: { fg: 'var(--state-cancelado)', bg: 'var(--state-cancelado-bg)' },
}

const ESTADO_LABELS: Record<Estado, string> = Object.fromEntries(
  ESTADOS.map((estado) => [estado.value, estado.label]),
) as Record<Estado, string>

export type StatusBadgeProps = {
  estado: Estado
}

export function StatusBadge({ estado }: StatusBadgeProps) {
  const style = ESTADO_STYLE[estado]
  return (
    <span
      className="status-badge"
      style={{
        color: style.fg,
        backgroundColor: style.bg,
      }}
    >
      {ESTADO_LABELS[estado]}
    </span>
  )
}
