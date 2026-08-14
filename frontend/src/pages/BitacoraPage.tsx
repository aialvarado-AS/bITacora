// ============================================================================
// bITacora — Página de Bitácora: TimelineFilters + ManualEntryForm + TimelineFeed
// Estilo glass, una sola columna en todos los breakpoints.
// ============================================================================

import { useMemo, useState } from 'react'
import { TimelineFilters } from '../components/bitacora/TimelineFilters'
import { ManualEntryForm } from '../components/bitacora/ManualEntryForm'
import { TimelineFeed } from '../components/bitacora/TimelineFeed'
import { useBitacoraFeed } from '../api/bitacora'
import type { BitacoraFiltros } from '../api/bitacora'

export function BitacoraPage() {
  const [filtros, setFiltros] = useState<BitacoraFiltros>({})

  const feedQuery = useBitacoraFeed(filtros)

  const registros = useMemo(
    () => feedQuery.data?.pages.flatMap((page) => page.results) ?? [],
    [feedQuery.data],
  )
  const totalCount = feedQuery.data?.pages[0]?.count

  const handleFiltrosChange = (patch: Partial<BitacoraFiltros>): void => {
    setFiltros((current) => ({ ...current, ...patch }))
  }

  return (
    <div className="bitacora-page stack gap-lg">
      <div className="stack gap-xs">
        <h1>Bitácora</h1>
        <p className="text-2">Historial de actividad y entradas manuales de todos los módulos.</p>
      </div>

      <TimelineFilters values={filtros} onChange={handleFiltrosChange} />

      <ManualEntryForm />

      <TimelineFeed
        registros={registros}
        totalCount={totalCount}
        isLoading={feedQuery.isLoading}
        isFetchingNextPage={feedQuery.isFetchingNextPage}
        hasNextPage={Boolean(feedQuery.hasNextPage)}
        onLoadMore={() => feedQuery.fetchNextPage()}
      />
    </div>
  )
}

export default BitacoraPage
