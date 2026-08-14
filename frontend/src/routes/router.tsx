// ============================================================================
// bITacora — Definición de rutas de la aplicación
// Usa páginas STUB para las secciones de módulo/dashboard/bitácora/admin;
// se reemplazan por las páginas reales en la fase de integración.
// ============================================================================

import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { BitacoraPage } from '../pages/BitacoraPage'
import { AdminUsersPage } from '../pages/AdminUsersPage'
import { ModuleListPage } from '../pages/modules/ModuleListPage'
import { comprasConfig } from '../modules/compras/config'
import { proyectosConfig } from '../modules/proyectos/config'
import { requerimientosConfig } from '../modules/requerimientos/config'
import { mantenimientosConfig } from '../modules/mantenimientos/config'
import { useAuthStore } from '../stores/authStore'

function NotFoundPage() {
  return (
    <div className="glass-card stack gap-sm" style={{ padding: 24 }}>
      <h2>404 — Página no encontrada</h2>
      <p className="text-2">La ruta solicitada no existe.</p>
    </div>
  )
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="compras" element={<ModuleListPage config={comprasConfig} />} />
        <Route path="compras/:id" element={<ModuleListPage config={comprasConfig} />} />
        <Route path="proyectos" element={<ModuleListPage config={proyectosConfig} />} />
        <Route path="proyectos/:id" element={<ModuleListPage config={proyectosConfig} />} />
        <Route path="requerimientos" element={<ModuleListPage config={requerimientosConfig} />} />
        <Route path="requerimientos/:id" element={<ModuleListPage config={requerimientosConfig} />} />
        <Route path="mantenimientos" element={<ModuleListPage config={mantenimientosConfig} />} />
        <Route path="mantenimientos/:id" element={<ModuleListPage config={mantenimientosConfig} />} />
        <Route path="bitacora" element={<BitacoraPage />} />
        <Route path="admin/usuarios" element={<AdminUsersPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
