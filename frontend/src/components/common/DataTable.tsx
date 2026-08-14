// ============================================================================
// bITacora — Tabla de datos genérica (@tanstack/react-table)
// ============================================================================

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { EmptyState } from './EmptyState'

export type DataTableProps<T> = {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  onRowClick?: (row: T) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  getRowId?: (row: T) => string
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  isLoading = false,
  emptyTitle = 'Sin resultados',
  emptyDescription = 'No hay elementos que coincidan con los filtros actuales.',
  getRowId,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
  })

  if (!isLoading && data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="data-table-wrapper scroll-x glass-card">
      <table className="data-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="data-table__row--skeleton">
                  {columns.map((_column, columnIndex) => (
                    <td key={columnIndex}>
                      <span className="skeleton-line" />
                    </td>
                  ))}
                </tr>
              ))
            : table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={onRowClick ? 'data-table__row--clickable' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
