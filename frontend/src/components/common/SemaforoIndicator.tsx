// ============================================================================
// bITacora — Indicador visual del semáforo de plazos
// ============================================================================

import { SEMAFORO_COLORS } from '../../lib/semaforo'
import type { Semaforo } from '../../types/common'

export type SemaforoIndicatorProps = {
  semaforo: Semaforo
  showLabel?: boolean
}

export function SemaforoIndicator({ semaforo, showLabel = false }: SemaforoIndicatorProps) {
  const style = SEMAFORO_COLORS[semaforo]
  return (
    <span className="semaforo-indicator" title={style.label}>
      <span
        className="semaforo-dot"
        style={{ backgroundColor: style.fg }}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="semaforo-label" style={{ color: style.fg }}>
          {style.label}
        </span>
      )}
      <span className="visually-hidden">{style.label}</span>
    </span>
  )
}
