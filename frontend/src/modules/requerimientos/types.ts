// ============================================================================
// bITacora — Tipos del módulo Requerimientos internos
// ============================================================================

import type { BaseTrackedItem } from '../../types/common'

export type RequerimientoInterno = BaseTrackedItem & {
  solicitante_nombre: string
  area_solicitante: string
}
