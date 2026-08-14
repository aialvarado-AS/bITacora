// ============================================================================
// bITacora — Tipos del módulo Proyectos
// ============================================================================

import type { BaseTrackedItem } from '../../types/common'

export type Proyecto = BaseTrackedItem & {
  codigo_proyecto: string
  presupuesto: number | null
  avance_pct: number
}
