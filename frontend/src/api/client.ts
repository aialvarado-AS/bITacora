// ============================================================================
// bITacora — Cliente HTTP genérico con refresh automático de JWT
// ============================================================================

import { useAuthStore } from '../stores/authStore'

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null
        const data = await res.json()
        if (!data.access) return null
        useAuthStore.getState().setTokens({
          access: data.access,
          refresh: data.refresh ?? refreshToken,
        })
        return data.access as string
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

function buildHeaders(options: RequestInit, accessToken: string | null): Headers {
  const headers = new Headers(options.headers)
  const isFormData = options.body instanceof FormData
  if (!isFormData && !headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return headers
}

/**
 * Realiza una petición a la API usando rutas relativas (/api/...).
 * En dev, el proxy de Vite resuelve el destino; en producción, el mismo
 * origen sirve tanto el frontend como la API.
 * Agrega el header Authorization automáticamente y reintenta UNA vez
 * tras refrescar el access token si la respuesta es 401.
 */
export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken

  const doFetch = async (token: string | null): Promise<Response> =>
    fetch(path, {
      ...options,
      headers: buildHeaders(options, token),
    })

  let response = await doFetch(accessToken)

  if (response.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      response = await doFetch(newToken)
    } else {
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new ApiError(401, 'Sesión expirada')
    }
  }

  if (!response.ok) {
    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = undefined
    }
    const message =
      (typeof data === 'object' && data && 'detail' in data && String((data as { detail: unknown }).detail)) ||
      `Error ${response.status}`
    throw new ApiError(response.status, message, data)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
