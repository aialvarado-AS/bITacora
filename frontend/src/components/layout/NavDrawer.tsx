// ============================================================================
// bITacora — Drawer de navegación mobile/tablet (visible bajo 1024px)
// ============================================================================

import * as Dialog from '@radix-ui/react-dialog'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { getVisibleNavItems } from './navItems'

export type NavDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NavDrawer({ open, onOpenChange }: NavDrawerProps) {
  const rol = useAuthStore((state) => state.user?.rol)
  const items = getVisibleNavItems(rol)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="nav-drawer__overlay" />
        <Dialog.Content className="nav-drawer__content glass-strong">
          <Dialog.Title className="visually-hidden">Menú de navegación</Dialog.Title>
          <div className="nav-drawer__header">
            <span className="sidebar__brand-label">bITacora</span>
            <Dialog.Close asChild>
              <button type="button" className="icon-btn" aria-label="Cerrar menú">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <nav className="nav-drawer__nav">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => onOpenChange(false)}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
