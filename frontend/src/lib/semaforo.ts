// ============================================================================
// bITacora — Colores/labels del semáforo de plazos
// ============================================================================

import type { Semaforo } from '../types/common'

export type SemaforoStyle = {
  bg: string
  fg: string
  label: string
}

export const SEMAFORO_COLORS: Record<Semaforo, SemaforoStyle> = {
  verde: {
    bg: 'var(--sem-ok-bg)',
    fg: 'var(--sem-ok)',
    label: 'A tiempo',
  },
  amarillo: {
    bg: 'var(--sem-warn-bg)',
    fg: 'var(--sem-warn)',
    label: 'Por vencer',
  },
  rojo: {
    bg: 'var(--sem-danger-bg)',
    fg: 'var(--sem-danger)',
    label: 'Vencido',
  },
  gris: {
    bg: 'var(--sem-gris-bg)',
    fg: 'var(--sem-gris)',
    label: 'Cerrado',
  },
}
