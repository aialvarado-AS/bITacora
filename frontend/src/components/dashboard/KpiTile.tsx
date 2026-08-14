// ============================================================================
// bITacora — Dashboard: tile individual de KPI (glass, número + etiqueta)
// ============================================================================

export type KpiTileProps = {
  label: string
  value: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
  /** Color del ícono y del valor (usar variables --sem-... o --as-...). */
  fg?: string
  /** Fondo del círculo del ícono. */
  bg?: string
  isLoading?: boolean
}

export function KpiTile({
  label,
  value,
  icon: Icon,
  fg = 'var(--as-blue)',
  bg = 'var(--glass-bg-strong)',
  isLoading = false,
}: KpiTileProps) {
  return (
    <div className="kpi-tile glass-card">
      <span className="kpi-tile__icon" style={{ color: fg, backgroundColor: bg }} aria-hidden="true">
        {Icon && <Icon size={18} />}
      </span>
      <span className="kpi-tile__body">
        {isLoading ? (
          <span className="skeleton-line" style={{ width: '48px', height: '22px' }} />
        ) : (
          <span className="kpi-tile__value" style={{ color: fg }}>
            {value}
          </span>
        )}
        <span className="kpi-tile__label text-2">{label}</span>
      </span>
    </div>
  )
}
