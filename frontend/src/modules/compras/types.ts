// ============================================================================
// bITacora — Tipos del módulo Compras
// ============================================================================

import type { BaseTrackedItem } from '../../types/common'

export type Compra = BaseTrackedItem & {
  tiene_oc: boolean
  numero_oc: string
  centro_costo: string
}
