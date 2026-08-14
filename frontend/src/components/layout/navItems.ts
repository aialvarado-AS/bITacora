// ============================================================================
// bITacora — Definición de las 7 secciones de navegación
// ============================================================================

import {
  Home,
  ShoppingCart,
  FolderKanban,
  ClipboardList,
  Wrench,
  BookText,
  Users,
} from 'lucide-react'
import type { Rol } from '../../lib/roles'

export type NavItem = {
  to: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  adminOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/compras', label: 'Compras', icon: ShoppingCart },
  { to: '/proyectos', label: 'Proyectos', icon: FolderKanban },
  { to: '/requerimientos', label: 'Requerimientos Internos', icon: ClipboardList },
  { to: '/mantenimientos', label: 'Mantenimientos', icon: Wrench },
  { to: '/bitacora', label: 'Bitácora', icon: BookText },
  { to: '/admin/usuarios', label: 'Admin Usuarios', icon: Users, adminOnly: true },
]

export function getVisibleNavItems(rol: Rol | null | undefined): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.adminOnly || rol === 'ADMIN')
}
