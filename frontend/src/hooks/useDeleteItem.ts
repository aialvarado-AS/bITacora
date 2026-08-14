// ============================================================================
// bITacora — Hook genérico para eliminar un item de módulo
// ============================================================================

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { ModuleConfig } from '../lib/moduleConfig.types'

export function useDeleteItem(config: ModuleConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number | string) =>
      apiFetch<void>(`${config.apiBasePath}${id}/`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [config.apiBasePath, 'list'] })
      queryClient.removeQueries({ queryKey: [config.apiBasePath, 'detail', id] })
    },
  })
}
