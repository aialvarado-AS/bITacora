// ============================================================================
// bITacora — Helpers de roles de usuario
// ============================================================================

export type Rol = 'ADMIN' | 'EDITOR' | 'LECTOR'

export function puedeEditar(rol: Rol | null | undefined): boolean {
  return rol === 'EDITOR' || rol === 'ADMIN'
}

export function esAdmin(rol: Rol | null | undefined): boolean {
  return rol === 'ADMIN'
}
