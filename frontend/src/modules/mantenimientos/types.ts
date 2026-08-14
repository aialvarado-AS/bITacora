// ============================================================================
// bITacora — Tipos del módulo Mantenimientos
// ============================================================================

import type { BaseTrackedItem } from '../../types/common'

export type TipoMantenimiento = 'PREVENTIVO' | 'CORRECTIVO'

export type Mantenimiento = BaseTrackedItem & {
  tipo_mantenimiento: TipoMantenimiento
  equipo_activo: string
  ubicacion: string
}

export const TIPOS_MANTENIMIENTO: { value: TipoMantenimiento; label: string }[] = [
  { value: 'PREVENTIVO', label: 'Preventivo' },
  { value: 'CORRECTIVO', label: 'Correctivo' },
]
