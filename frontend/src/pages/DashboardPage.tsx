// ============================================================================
// bITacora — Página de Inicio / Dashboard de KPIs
// KpiGrid (totales por semáforo) + 4 ModuleSummaryCard + ResponsibleBreakdownChart
// + AlertList (Mis pendientes). Responsive vía auto-fit, sin breakpoints duros.
// ============================================================================

import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react'
import { KpiGrid } from '../components/dashboard/KpiGrid'
import { KpiTile } from '../components/dashboard/KpiTile'
import { ModuleSummaryCard } from '../components/dashboard/ModuleSummaryCard'
import { ResponsibleBreakdownChart } from '../components/dashboard/ResponsibleBreakdownChart'
import { AlertList } from '../components/dashboard/AlertList'
import { useDashboardResumen, useMisPendientes } from '../api/dashboard'

export function DashboardPage() {
  const resumenQuery = useDashboardResumen()
  const pendientesQuery = useMisPendientes()

  const porModulo = resumenQuery.data?.por_modulo ?? []
  const porSemaforo = resumenQuery.data?.por_semaforo
  const porResponsable = resumenQuery.data?.por_responsable ?? []
  const pendientes = pendientesQuery.data ?? []

  return (
    <div className="dashboard-page stack gap-lg">
      <div className="stack gap-xs">
        <h1>Inicio</h1>
        <p className="text-2">Resumen de KPIs y pendientes de todos los módulos de seguimiento.</p>
      </div>

      {resumenQuery.isError && (
        <div className="glass-card" style={{ padding: 16, color: 'var(--sem-danger)' }}>
          No se pudo cargar el resumen del dashboard.
        </div>
      )}

      <KpiGrid>
        <KpiTile
          label="A tiempo"
          value={porSemaforo?.verde ?? 0}
          icon={CheckCircle2}
          fg="var(--sem-ok)"
          bg="var(--sem-ok-bg)"
          isLoading={resumenQuery.isLoading}
        />
        <KpiTile
          label="Por vencer"
          value={porSemaforo?.amarillo ?? 0}
          icon={Clock3}
          fg="var(--sem-warn)"
          bg="var(--sem-warn-bg)"
          isLoading={resumenQuery.isLoading}
        />
        <KpiTile
          label="Vencidos"
          value={porSemaforo?.rojo ?? 0}
          icon={AlertTriangle}
          fg="var(--sem-danger)"
          bg="var(--sem-danger-bg)"
          isLoading={resumenQuery.isLoading}
        />
      </KpiGrid>

      <section className="stack gap-md">
        <h2>Resumen por módulo</h2>
        <div className="dashboard-page__modules">
          {resumenQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="module-summary-card glass-card stack gap-sm">
                  <span className="skeleton-line" style={{ width: '50%' }} />
                  <span className="skeleton-line" />
                  <span className="skeleton-line" />
                </div>
              ))
            : porModulo.map((modulo) => <ModuleSummaryCard key={modulo.modulo} resumen={modulo} />)}
        </div>
      </section>

      <div className="dashboard-page__lower">
        <ResponsibleBreakdownChart data={porResponsable} isLoading={resumenQuery.isLoading} />
        <AlertList items={pendientes} isLoading={pendientesQuery.isLoading} />
      </div>
    </div>
  )
}

export default DashboardPage
