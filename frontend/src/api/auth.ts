// ============================================================================
// bITacora — Endpoints de autenticación
// ============================================================================

import { apiFetch } from './client'
import type { Rol } from '../lib/roles'
import type { AuthTokens } from '../stores/authStore'

export type UsuarioResumen = {
  id: number
  username: string
  first_name: string
  last_name: string
  rol: Rol
}

export type MeResponse = UsuarioResumen & {
  email: string
}

export type LoginResponse = AuthTokens & { user: MeResponse }

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function me(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/api/auth/me/')
}

export function logout(): void {
  // La limpieza de tokens la realiza authStore.logout(); esta función
  // queda como punto de extensión si se agrega un endpoint de blacklist.
}
