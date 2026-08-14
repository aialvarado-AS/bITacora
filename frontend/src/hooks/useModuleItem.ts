// ============================================================================
// bITacora — Hook genérico para obtener el detalle de un item de módulo
// ============================================================================

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { ModuleConfig } from '../lib/moduleConfig.types'
import type { BaseTrackedItem } from '../types/common'

export function useModuleItem<T extends BaseTrackedItem = BaseTrackedItem>(
  config: ModuleConfig,
  id: number | string | undefined,
) {
  return useQuery({
    queryKey: [config.apiBasePath, 'detail', id],
    queryFn: () => apiFetch<T>(`${config.apiBasePath}${id}/`),
    enabled: id !== undefined && id !== null && id !== '',
  })
}
