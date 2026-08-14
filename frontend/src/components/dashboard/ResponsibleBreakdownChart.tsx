// ============================================================================
// bITacora — Dashboard: carga por responsable (BarChart horizontal, recharts)
// responsable_nombre en el eje de categorías contra total_asignados/atrasados.
// ============================================================================

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Users } from 'lucide-react'
import { EmptyState } from '../common/EmptyState'
import type { ResumenPorResponsable } from '../../api/dashboard'

export type ResponsibleBreakdownChartProps = {
  data: ResumenPorResponsable[]
  isLoading?: boolean
}

const ROW_HEIGHT = 40
const MIN_HEIGHT = 200

export function ResponsibleBreakdownChart({ data, isLoading = false }: ResponsibleBreakdownChartProps) {
  if (isLoading) {
    return (
      <div className="responsible-chart glass-card stack gap-sm">
        <span className="skeleton-line" style={{ width: '40%' }} />
        <span className="skeleton-line" style={{ height: MIN_HEIGHT }} />
      </div>
    )
  }

  return (
    <div className="responsible-chart glass-card">
      <h3 className="responsible-chart__title">Carga por responsable</h3>

      {data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin asignaciones"
          description="Ningún responsable tiene items asignados todavía."
        />
      ) : (
        <div style={{ width: '100%', height: Math.max(MIN_HEIGHT, data.length * ROW_HEIGHT) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: 'var(--text-3)', fontSize: 12 }}
                stroke="var(--border-1)"
              />
              <YAxis
                type="category"
                dataKey="responsable_nombre"
                width={120}
                tick={{ fill: 'var(--text-2)', fontSize: 12 }}
                stroke="var(--border-1)"
              />
              <Tooltip
                cursor={{ fill: 'var(--glass-bg)' }}
                contentStyle={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-1)',
                  borderRadius: 8,
                  color: 'var(--text-1)',
                  fontSize: 12,
                }}
                labelStyle={{ color: 'var(--text-1)', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-2)' }} />
              <Bar dataKey="total_asignados" name="Asignados" fill="var(--as-blue)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="atrasados" name="Atrasados" fill="var(--sem-danger)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
