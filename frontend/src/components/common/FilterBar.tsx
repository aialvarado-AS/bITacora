// ============================================================================
// bITacora — Barra de filtros genérica (búsqueda + selects + semáforo)
// ============================================================================

import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import type { FieldConfig } from '../../lib/moduleConfig.types'
import { SEMAFORO_COLORS } from '../../lib/semaforo'

export type FilterValues = Record<string, string | undefined>

export type FilterBarProps = {
  fields: FieldConfig[]
  values: FilterValues
  onChange: (key: string, value: string | undefined) => void
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  semaforoValue?: string
  onSemaforoChange?: (value: string | undefined) => void
  actions?: ReactNode
}

const SEMAFORO_OPTIONS = Object.entries(SEMAFORO_COLORS).map(([value, style]) => ({
  value,
  label: style.label,
}))

export function FilterBar({
  fields,
  values,
  onChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar…',
  semaforoValue,
  onSemaforoChange,
  actions,
}: FilterBarProps) {
  const filterFields = fields.filter((field) => field.showInFilters)

  return (
    <div className="filter-bar glass-card">
      <div className="filter-bar__search">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={search}
          placeholder={searchPlaceholder}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Buscar"
        />
      </div>

      <div className="filter-bar__selects">
        {filterFields.map((field) => (
          <select
            key={field.key}
            className="filter-bar__select"
            value={values[field.key] ?? ''}
            onChange={(event) => onChange(field.key, event.target.value || undefined)}
            aria-label={field.label}
          >
            <option value="">{field.label}: todos</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}

        {onSemaforoChange && (
          <select
            className="filter-bar__select"
            value={semaforoValue ?? ''}
            onChange={(event) => onSemaforoChange(event.target.value || undefined)}
            aria-label="Semáforo"
          >
            <option value="">Semáforo: todos</option>
            {SEMAFORO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {actions && <div className="filter-bar__actions">{actions}</div>}
    </div>
  )
}
