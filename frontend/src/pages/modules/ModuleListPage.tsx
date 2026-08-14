// ============================================================================
// bITacora — Página de listado genérica de un módulo
// FilterBar + DataTable (>=860px) o CardList (<860px) + botón Nuevo
// ============================================================================

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { DataTable } from '../../components/common/DataTable'
import { CardList } from '../../components/common/CardList'
import { FilterBar, type FilterValues } from '../../components/common/FilterBar'
import { StatusBadge } from '../../components/common/StatusBadge'
import { PriorityBadge } from '../../components/common/PriorityBadge'
import { SemaforoIndicator } from '../../components/common/SemaforoIndicator'
import { ResponsableChip } from '../../components/common/ResponsableChip'
import { ModuleDetailPanel } from './ModuleDetailPanel'
import { useModuleItems } from '../../hooks/useModuleItems'
import { useResponsables } from '../../hooks/useResponsables'
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery'
import { useAuthStore } from '../../stores/authStore'
import { puedeEditar } from '../../lib/roles'
import { formatFecha } from '../../lib/formatters'
import { withResponsableOptions } from '../../lib/moduleConfig.types'
import type { ModuleConfig } from '../../lib/moduleConfig.types'
import type { BaseTrackedItem, Semaforo } from '../../types/common'

export type ModuleListPageProps = {
  config: ModuleConfig
}

export function ModuleListPage({ config }: ModuleListPageProps) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterValues>({})
  const [semaforoFilter, setSemaforoFilter] = useState<string | undefined>()
  const { id: idFromRoute } = useParams()
  const [activeItemId, setActiveItemId] = useState<number | 'new' | null>(
    idFromRoute ? Number(idFromRoute) : null,
  )
  const navigate = useNavigate()

  useEffect(() => {
    setActiveItemId(idFromRoute ? Number(idFromRoute) : null)
  }, [idFromRoute])

  const rol = useAuthStore((state) => state.user?.rol)
  const isDesktopTable = useMediaQuery(BREAKPOINTS.tableBreak)
  const { data: responsables } = useResponsables()
  const filterFields = useMemo(
    () => withResponsableOptions(config.baseFields, responsables),
    [config.baseFields, responsables],
  )

  const { data, isLoading } = useModuleItems<BaseTrackedItem>(config, {
    search: search || undefined,
    ...filters,
  })

  const items = useMemo<BaseTrackedItem[]>(() => {
    const results = data?.results ?? []
    if (!semaforoFilter) return results
    return results.filter((item) => item.semaforo === semaforoFilter)
  }, [data, semaforoFilter])

  const routeBase = config.apiBasePath.replace(/^\/api/, '').replace(/\/$/, '')

  const openItem = (id: number | 'new') => {
    setActiveItemId(id)
    if (id !== 'new') navigate(`${routeBase}/${id}`)
  }

  const closeItem = () => {
    setActiveItemId(null)
    if (idFromRoute) navigate(routeBase)
  }

  const columns = useMemo<ColumnDef<BaseTrackedItem, unknown>[]>(
    () => [
      { header: 'Título', accessorKey: 'titulo' },
      {
        header: 'Estado',
        accessorKey: 'estado',
        cell: (info) => <StatusBadge estado={info.getValue() as BaseTrackedItem['estado']} />,
      },
      {
        header: 'Prioridad',
        accessorKey: 'prioridad',
        cell: (info) => <PriorityBadge prioridad={info.getValue() as BaseTrackedItem['prioridad']} />,
      },
      {
        header: 'Responsable',
        accessorKey: 'responsable_actual_detail',
        cell: (info) => (
          <ResponsableChip responsable={info.getValue() as BaseTrackedItem['responsable_actual_detail']} />
        ),
      },
      {
        header: 'Plazo',
        accessorKey: 'fecha_plazo_maximo',
        cell: (info) => formatFecha(info.getValue() as string),
      },
      {
        header: 'Semáforo',
        accessorKey: 'semaforo',
        cell: (info) => <SemaforoIndicator semaforo={info.getValue() as Semaforo} />,
      },
    ],
    [],
  )

  return (
    <div className="module-list-page stack gap-lg">
      <div className="module-list-page__header row gap-md">
        <h1>{config.label}</h1>
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        search={search}
        onSearchChange={setSearch}
        semaforoValue={semaforoFilter}
        onSemaforoChange={setSemaforoFilter}
        actions={
          puedeEditar(rol) ? (
            <button type="button" className="btn btn--primary" onClick={() => openItem('new')}>
              <Plus size={16} />
              Nuevo
            </button>
          ) : undefined
        }
      />

      {isDesktopTable ? (
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          onRowClick={(item) => openItem(item.id)}
          getRowId={(item) => String(item.id)}
        />
      ) : (
        <CardList
          items={items}
          isLoading={isLoading}
          getKey={(item) => item.id}
          onItemClick={(item) => openItem(item.id)}
          renderItem={(item) => (
            <div className="stack gap-sm">
              <div className="row gap-sm" style={{ justifyContent: 'space-between' }}>
                <strong>{item.titulo}</strong>
                <SemaforoIndicator semaforo={item.semaforo} />
              </div>
              <div className="row gap-sm">
                <StatusBadge estado={item.estado} />
                <PriorityBadge prioridad={item.prioridad} />
              </div>
              <div className="row gap-sm" style={{ justifyContent: 'space-between' }}>
                <ResponsableChip responsable={item.responsable_actual_detail} />
                <span className="text-2">{formatFecha(item.fecha_plazo_maximo)}</span>
              </div>
            </div>
          )}
        />
      )}

      <ModuleDetailPanel config={config} itemId={activeItemId} onClose={closeItem} />
    </div>
  )
}
