// ============================================================================
// bITacora — Sidebar fija y colapsable (visible en >=1024px)
// ============================================================================

import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useUiStore } from '../../stores/uiStore'
import { getVisibleNavItems } from './navItems'

export function Sidebar() {
  const rol = useAuthStore((state) => state.user?.rol)
  const collapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const items = getVisibleNavItems(rol)

  return (
    <aside className={`sidebar glass ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark" aria-hidden="true" />
        {!collapsed && <span className="sidebar__brand-label">bITacora</span>}
      </div>

      <nav className="sidebar__nav">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <button
        type="button"
        className="sidebar__collapse-btn"
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  )
}
