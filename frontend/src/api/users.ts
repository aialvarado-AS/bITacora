// ============================================================================
// bITacora — Endpoints y hooks de administración de usuarios (solo ADMIN)
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { Rol } from '../lib/roles'
import type { Paginated } from '../types/common'

const USUARIOS_BASE_PATH = '/api/auth/usuarios/'
const USUARIOS_QUERY_KEY = [USUARIOS_BASE_PATH, 'list']

export type Usuario = {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  rol: Rol
  is_active: boolean
}

/** Payload aceptado por PATCH (todos los campos opcionales, incluida la password). */
export type UsuarioPayload = {
  username: string
  password?: string
  first_name: string
  last_name: string
  email: string
  rol: Rol
  is_active?: boolean
}

/** Payload de creación: la password es obligatoria al crear un usuario nuevo. */
export type NuevoUsuarioPayload = Omit<UsuarioPayload, 'password'> & { password: string }

function extractUsuarios(data: Paginated<Usuario> | Usuario[]): Usuario[] {
  return Array.isArray(data) ? data : data.results
}

/**
 * Lista todos los usuarios. Acepta `enabled` para evitar la petición cuando
 * quien consulta no tiene rol ADMIN (la página lo usa para no golpear el
 * endpoint si el usuario autenticado no tiene permiso).
 */
export function useUsuarios(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: USUARIOS_QUERY_KEY,
    queryFn: () => apiFetch<Paginated<Usuario> | Usuario[]>(USUARIOS_BASE_PATH),
    select: extractUsuarios,
    enabled: options?.enabled ?? true,
  })
}

export function useCrearUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: NuevoUsuarioPayload) =>
      apiFetch<Usuario>(USUARIOS_BASE_PATH, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY })
    },
  })
}

export function useActualizarUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UsuarioPayload> }) =>
      apiFetch<Usuario>(`${USUARIOS_BASE_PATH}${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY })
    },
  })
}

export function useEliminarUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`${USUARIOS_BASE_PATH}${id}/`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY })
    },
  })
}
