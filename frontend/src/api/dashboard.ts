// ============================================================================
// bITacora — Endpoints y hooks del Dashboard de KPIs
// GET /api/dashboard/resumen/ (conteos por módulo/semáforo/responsable) y
// GET /api/dashboard/mis-pendientes/ (lista plana de items asignados al
// Responsable del usuario autenticado, cruzando los 4 módulos).
// ============================================================================

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { BaseTrackedItem } from '../types/common'

/**
 * Coincide con el `key` de cada ModuleConfig (compras/proyectos/
 * requerimientos/mantenimientos), no con `item._meta.model_name`.
 */
export type ModuloDashboard = 'compras' | 'proyectos' | 'requerimientos' | 'mantenimientos'

export type ResumenModulo = {
  modulo: ModuloDashboard
  total: number
  pendientes: number
  en_proceso: number
  completados: number
  atrasados: number
}

export type ResumenPorSemaforo = {
  verde: number
  amarillo: number
  rojo: number
  gris: number
}

export type ResumenPorResponsable = {
  responsable_id: number
  responsable_nombre: string
  total_asignados: number
  atrasados: number
}

export type DashboardResumen = {
  /** Siempre 4 entradas, en orden compras/proyectos/requerimientos/mantenimientos. */
  por_modulo: ResumenModulo[]
  por_semaforo: ResumenPorSemaforo
  /** Solo responsables con >=1 item asignado, ya ordenado por el backend. */
  por_responsable: ResumenPorResponsable[]
}

/**
 * Item de "Mis pendientes". Los campos heredados de ItemSeguimiento están
 * garantizados en los 4 módulos; los campos propios de cada módulo
 * (numero_oc, codigo_proyecto, tipo_mantenimiento, etc.) varían según
 * `modulo` y se acceden vía índice.
 */
export type PendienteItem = BaseTrackedItem & {
  modulo: ModuloDashboard
  [key: string]: unknown
}

const RESUMEN_PATH = '/api/dashboard/resumen/'
const MIS_PENDIENTES_PATH = '/api/dashboard/mis-pendientes/'

export const DASHBOARD_RESUMEN_KEY = ['dashboard', 'resumen']
export const DASHBOARD_MIS_PENDIENTES_KEY = ['dashboard', 'mis-pendientes']

/** GET /api/dashboard/resumen/ — conteos por módulo, semáforo y responsable. */
export function useDashboardResumen() {
  return useQuery({
    queryKey: DASHBOARD_RESUMEN_KEY,
    queryFn: () => apiFetch<DashboardResumen>(RESUMEN_PATH),
  })
}

/**
 * GET /api/dashboard/mis-pendientes/ — lista plana (sin paginar, sin
 * envoltorio count/next/previous/results) ordenada por fecha_plazo_maximo
 * ascendente. [] si el usuario autenticado no tiene un Responsable asociado.
 */
export function useMisPendientes() {
  return useQuery({
    queryKey: DASHBOARD_MIS_PENDIENTES_KEY,
    queryFn: () => apiFetch<PendienteItem[]>(MIS_PENDIENTES_PATH),
  })
}
