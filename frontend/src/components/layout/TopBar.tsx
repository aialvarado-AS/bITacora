// ============================================================================
// bITacora — Barra superior (hamburguesa en mobile/tablet, usuario, tema)
// ============================================================================

import { Menu, LogOut } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'

export type TopBarProps = {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const user = useAuthStore((state) => state.user)
  const { logout } = useAuth()

  return (
    <header className="topbar glass">
      <button
        type="button"
        className="icon-btn topbar__menu-btn"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      <div className="topbar__spacer" />

      <div className="topbar__actions">
        <ThemeToggle />
        {user && (
          <div className="topbar__user">
            <span className="topbar__user-name">
              {user.first_name || user.username}
            </span>
            <span className="topbar__user-rol">{user.rol}</span>
          </div>
        )}
        <button
          type="button"
          className="icon-btn"
          onClick={logout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
