// ============================================================================
// bITacora — Filtros del feed: selects de módulo/tipo/autor + rango de fechas
// ============================================================================

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../api/client'
import { MODULOS_BITACORA, TIPOS_REGISTRO } from '../../api/bitacora'
import type { BitacoraFiltros } from '../../api/bitacora'
import type { UsuarioResumen } from '../../api/auth'
import type { Paginated } from '../../types/common'

export type TimelineFiltersProps = {
  values: BitacoraFiltros
  onChange: (patch: Partial<BitacoraFiltros>) => void
}

function extractResults<T>(data: Paginated<T> | T[] | undefined): T[] {
  if (!data) return []
  return Array.isArray(data) ? data : data.results
}

function nombreUsuario(usuario: UsuarioResumen): string {
  const nombre = `${usuario.first_name} ${usuario.last_name}`.trim()
  return nombre || usuario.username
}

export function TimelineFilters({ values, onChange }: TimelineFiltersProps) {
  const usuariosQuery = useQuery({
    queryKey: ['bitacora', 'usuarios-filtro'],
    queryFn: () => apiFetch<Paginated<UsuarioResumen> | UsuarioResumen[]>('/api/auth/usuarios/'),
    staleTime: 5 * 60 * 1000,
  })
  const usuarios = extractResults(usuariosQuery.data)

  return (
    <div className="timeline-filters glass-card">
      <div className="timeline-filters__row">
        <select
          className="filter-bar__select"
          value={values.modulo ?? ''}
          onChange={(event) => onChange({ modulo: event.target.value || undefined })}
          aria-label="Módulo"
        >
          <option value="">Módulo: todos</option>
          {MODULOS_BITACORA.map((modulo) => (
            <option key={modulo.value} value={modulo.value}>
              {modulo.label}
            </option>
          ))}
        </select>

        <select
          className="filter-bar__select"
          value={values.tipo ?? ''}
          onChange={(event) => onChange({ tipo: event.target.value || undefined })}
          aria-label="Tipo"
        >
          <option value="">Tipo: todos</option>
          {TIPOS_REGISTRO.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>

        <select
          className="filter-bar__select"
          value={values.autor !== undefined ? String(values.autor) : ''}
          onChange={(event) => onChange({ autor: event.target.value || undefined })}
          aria-label="Autor"
        >
          <option value="">Autor: todos</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {nombreUsuario(usuario)}
            </option>
          ))}
        </select>
      </div>

      <div className="timeline-filters__row timeline-filters__dates">
        <label className="timeline-filters__date">
          <span>Desde</span>
          <input
            type="date"
            value={values.desde ?? ''}
            onChange={(event) => onChange({ desde: event.target.value || undefined })}
          />
        </label>
        <label className="timeline-filters__date">
          <span>Hasta</span>
          <input
            type="date"
            value={values.hasta ?? ''}
            onChange={(event) => onChange({ hasta: event.target.value || undefined })}
          />
        </label>
      </div>
    </div>
  )
}
