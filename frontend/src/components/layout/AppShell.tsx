// ============================================================================
// bITacora — Layout principal (Sidebar + TopBar + NavDrawer + Outlet)
// ============================================================================

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { NavDrawer } from './NavDrawer'

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <TopBar onMenuClick={() => setDrawerOpen(true)} />
        <main className="app-shell__content container">
          <Outlet />
        </main>
      </div>
      <NavDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
