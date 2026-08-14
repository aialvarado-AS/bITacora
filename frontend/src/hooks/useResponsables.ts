// ============================================================================
// bITacora — Lista de responsables activos (para selects de responsable_actual)
// ============================================================================

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { Paginated, Responsable } from '../types/common'

export function useResponsables() {
  return useQuery({
    queryKey: ['/api/responsables/', 'activos'],
    queryFn: () => apiFetch<Paginated<Responsable>>('/api/responsables/?activo=true'),
    staleTime: 60 * 1000,
    select: (data) => data.results,
  })
}
