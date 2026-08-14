// ============================================================================
// bITacora — Chip con iniciales/nombre de un responsable
// ============================================================================

export type ResponsableChipData = {
  id: number
  nombre: string
  correo?: string
  area?: string
} | null

export type ResponsableChipProps = {
  responsable: ResponsableChipData
  showArea?: boolean
}

function getIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export function ResponsableChip({ responsable, showArea = false }: ResponsableChipProps) {
  if (!responsable) {
    return <span className="responsable-chip responsable-chip--empty">Sin asignar</span>
  }

  return (
    <span className="responsable-chip" title={responsable.correo ?? responsable.nombre}>
      <span className="responsable-chip__avatar" aria-hidden="true">
        {getIniciales(responsable.nombre)}
      </span>
      <span className="responsable-chip__text">
        <span className="responsable-chip__nombre">{responsable.nombre}</span>
        {showArea && responsable.area && (
          <span className="responsable-chip__area">{responsable.area}</span>
        )}
      </span>
    </span>
  )
}
