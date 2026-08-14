// ============================================================================
// bITacora — Dashboard: grid de KpiTile (auto-fit, minmax(160px,1fr))
// ============================================================================

import type { ReactNode } from 'react'

export type KpiGridProps = {
  children: ReactNode
}

export function KpiGrid({ children }: KpiGridProps) {
  return <div className="kpi-grid">{children}</div>
}
