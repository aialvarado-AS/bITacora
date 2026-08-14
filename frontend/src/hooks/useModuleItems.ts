// ============================================================================
// bITacora — Hook genérico para listar items de un módulo (paginado)
// ============================================================================

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { ModuleConfig } from '../lib/moduleConfig.types'
import type { BaseTrackedItem, Paginated } from '../types/common'

export type ModuleListParams = Record<string, string | number | boolean | undefined>

function buildQueryString(params?: ModuleListParams): string {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function useModuleItems<T extends BaseTrackedItem = BaseTrackedItem>(
  config: ModuleConfig,
  params?: ModuleListParams,
) {
  return useQuery({
    queryKey: [config.apiBasePath, 'list', params ?? {}],
    queryFn: () => apiFetch<Paginated<T>>(`${config.apiBasePath}${buildQueryString(params)}`),
    placeholderData: (previousData) => previousData,
  })
}
