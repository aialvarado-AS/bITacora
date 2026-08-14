// ============================================================================
// bITacora — Store de autenticación (zustand + persist en sessionStorage)
// ============================================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Rol } from '../lib/roles'

export type AuthUser = {
  id: number
  username: string
  first_name: string
  last_name: string
  rol: Rol
  email: string
}

export type AuthTokens = {
  access: string
  refresh: string
}

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  login: (tokens: AuthTokens, user: AuthUser) => void
  logout: () => void
  setTokens: (tokens: AuthTokens) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      login: (tokens, user) =>
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          user,
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
      setTokens: (tokens) =>
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
        }),
    }),
    {
      name: 'bitacora-auth',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
