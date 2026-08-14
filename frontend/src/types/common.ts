// ============================================================================
// bITacora — Tipos comunes compartidos por todos los módulos
// ============================================================================

import type { UsuarioResumen } from '../api/auth'

export type Responsable = {
  id: number
  nombre: string
  correo: string
  telefono: string
  area: string
  activo: boolean
}

export type Estado =
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'EN_ESPERA'
  | 'COMPLETADO'
  | 'CANCELADO'

export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'

export type Semaforo = 'verde' | 'amarillo' | 'rojo' | 'gris'

export type BaseTrackedItem = {
  id: number
  titulo: string
  descripcion: string
  estado: Estado
  prioridad: Prioridad
  responsable_actual: number | null
  responsable_actual_detail: Pick<Responsable, 'id' | 'nombre' | 'correo' | 'area'> | null
  fecha_inicio: string
  fecha_plazo_maximo: string
  fecha_completado: string | null
  semaforo: Semaforo
  creado_por: UsuarioResumen | null
  creado_en: string
  actualizado_en: string
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const ESTADOS: { value: Estado; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'EN_ESPERA', label: 'En espera' },
  { value: 'COMPLETADO', label: 'Completado' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

export const PRIORIDADES: { value: Prioridad; label: string }[] = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
]
