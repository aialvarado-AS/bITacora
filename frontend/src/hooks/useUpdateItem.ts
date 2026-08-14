// ============================================================================
// bITacora — Hook genérico para actualizar (parcial) un item de módulo
// ============================================================================

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { ModuleConfig } from '../lib/moduleConfig.types'
import type { BaseTrackedItem } from '../types/common'

export function useUpdateItem<T extends BaseTrackedItem = BaseTrackedItem>(config: ModuleConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<T> }) =>
      apiFetch<T>(`${config.apiBasePath}${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [config.apiBasePath, 'list'] })
      queryClient.invalidateQueries({ queryKey: [config.apiBasePath, 'detail', variables.id] })
    },
  })
}
