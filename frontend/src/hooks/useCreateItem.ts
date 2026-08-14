// ============================================================================
// bITacora — Hook genérico para crear un item de módulo
// ============================================================================

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { ModuleConfig } from '../lib/moduleConfig.types'
import type { BaseTrackedItem } from '../types/common'

export function useCreateItem<T extends BaseTrackedItem = BaseTrackedItem>(config: ModuleConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<T>) =>
      apiFetch<T>(config.apiBasePath, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.apiBasePath, 'list'] })
    },
  })
}
