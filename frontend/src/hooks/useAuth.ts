// ============================================================================
// bITacora — Hook de autenticación (estado de sesión + acciones)
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { login as loginRequest, me as meRequest } from '../api/auth'

export function useAuth() {
  const { user, accessToken, login: storeLogin, logout: storeLogout } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const isAuthenticated = Boolean(accessToken)

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: meRequest,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const { user: usuario, ...tokens } = await loginRequest(username, password)
      storeLogin(tokens, {
        id: usuario.id,
        username: usuario.username,
        first_name: usuario.first_name,
        last_name: usuario.last_name,
        rol: usuario.rol,
        email: usuario.email,
      })
      return usuario
    },
  })

  const logout = (): void => {
    storeLogout()
    queryClient.clear()
    navigate('/login')
  }

  return {
    user,
    isAuthenticated,
    meQuery,
    login: loginMutation,
    logout,
  }
}
