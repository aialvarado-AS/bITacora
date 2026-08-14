// ============================================================================
// bITacora — Endpoints y hooks de la Bitácora (feed de auditoría + manual)
// GET/POST /api/bitacora/ (parámetros opcionales: modulo, tipo, autor,
// desde, hasta), paginado por DRF (count, next, previous, results).
// ============================================================================

import { useInfiniteQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { UsuarioResumen } from './auth'
import type { Paginated } from '../types/common'

export type TipoRegistro =
  | 'MANUAL'
  | 'CREACION'
  | 'CAMBIO_ESTADO'
  | 'CAMBIO_RESPONSABLE'
  | 'CAMBIO_PLAZO'
  | 'CAMBIO_PRIORIDAD'
  | 'COMENTARIO'
  | 'ADJUNTO'

export const TIPOS_REGISTRO: { value: TipoRegistro; label: string }[] = [
  { value: 'MANUAL', label: 'Entrada manual' },
  { value: 'CREACION', label: 'Creación' },
  { value: 'CAMBIO_ESTADO', label: 'Cambio de estado' },
  { value: 'CAMBIO_RESPONSABLE', label: 'Cambio de responsable' },
  { value: 'CAMBIO_PLAZO', label: 'Cambio de plazo' },
  { value: 'CAMBIO_PRIORIDAD', label: 'Cambio de prioridad' },
  { value: 'COMENTARIO', label: 'Comentario' },
  { value: 'ADJUNTO', label: 'Adjunto' },
]

// Coinciden con el `key` de cada ModuleConfig (compras/proyectos/requerimientos/
// mantenimientos). El backend completa `modulo` con item._meta.model_name; si
// el nombre real de algún modelo difiere, ajustar el `value` correspondiente
// en la fase de integración (esto no afecta la UI, solo el filtrado exacto).
export const MODULOS_BITACORA: { value: string; label: string }[] = [
  { value: 'compras', label: 'Compras' },
  { value: 'proyectos', label: 'Proyectos' },
  { value: 'requerimientos', label: 'Requerimientos Internos' },
  { value: 'mantenimientos', label: 'Mantenimientos' },
]

export type RegistroActividad = {
  id: number
  modulo: string
  tipo: TipoRegistro
  autor: UsuarioResumen | null
  descripcion: string
  campo: string
  valor_anterior: string
  valor_nuevo: string
  creado_en: string
}

export type BitacoraFiltros = {
  modulo?: string
  tipo?: string
  autor?: number | string
  desde?: string
  hasta?: string
}

const BITACORA_BASE_PATH = '/api/bitacora/'

/** Clave base de react-query para el feed; se usa también para invalidar tras publicar. */
export const BITACORA_FEED_KEY = 'bitacora-feed'

function buildQueryString(filtros: BitacoraFiltros, page: number): string {
  const params = new URLSearchParams()
  if (filtros.modulo) params.set('modulo', filtros.modulo)
  if (filtros.tipo) params.set('tipo', filtros.tipo)
  if (filtros.autor !== undefined && filtros.autor !== '') {
    params.set('autor', String(filtros.autor))
  }
  if (filtros.desde) params.set('desde', filtros.desde)
  if (filtros.hasta) params.set('hasta', filtros.hasta)
  // Página 1 es la default de DRF (PageNumberPagination), se omite el param.
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `?${query}` : ''
}

/**
 * Feed paginado de la Bitácora (auditoría automática + entradas manuales).
 * Usa useInfiniteQuery para soportar un patrón "Cargar más" que acumula
 * páginas sin perder las ya cargadas al refetchear.
 */
export function useBitacoraFeed(filtros: BitacoraFiltros = {}) {
  return useInfiniteQuery({
    queryKey: [BITACORA_FEED_KEY, filtros],
    queryFn: ({ pageParam }) =>
      apiFetch<Paginated<RegistroActividad>>(
        `${BITACORA_BASE_PATH}${buildQueryString(filtros, pageParam)}`,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Crea una entrada manual en la Bitácora. El backend fuerza tipo=MANUAL y
 * autor=request.user; solo se envía la descripción.
 */
export async function crearEntradaManual(descripcion: string): Promise<RegistroActividad> {
  return apiFetch<RegistroActividad>(BITACORA_BASE_PATH, {
    method: 'POST',
    body: JSON.stringify({ descripcion }),
  })
}
