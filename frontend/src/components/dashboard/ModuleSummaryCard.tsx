// ============================================================================
// bITacora — Dashboard: tarjeta glass con el resumen de un módulo
// ============================================================================

import { Link } from 'react-router-dom'
import { ShoppingCart, FolderKanban, ClipboardList, Wrench, ArrowRight } from 'lucide-react'
import type { ModuloDashboard, ResumenModulo } from '../../api/dashboard'

export type ModuloMeta = {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  /** Ruta del frontend (sin prefijo /api), p.ej. "/compras". */
  to: string
}

/**
 * Metadatos de presentación por módulo. Las claves coinciden con
 * ModuloDashboard (= `modulo` que devuelve el backend del dashboard).
 * Se exporta para que otros componentes del dashboard (p.ej. AlertList)
 * puedan resolver label/ruta sin duplicar el mapeo.
 */
export const MODULO_META: Record<ModuloDashboard, ModuloMeta> = {
  compras: { label: 'Compras', icon: ShoppingCart, to: '/compras' },
  proyectos: { label: 'Proyectos', icon: FolderKanban, to: '/proyectos' },
  requerimientos: { label: 'Requerimientos Internos', icon: ClipboardList, to: '/requerimientos' },
  mantenimientos: { label: 'Mantenimientos', icon: Wrench, to: '/mantenimientos' },
}

export type ModuleSummaryCardProps = {
  resumen: ResumenModulo
}

export function ModuleSummaryCard({ resumen }: ModuleSummaryCardProps) {
  const meta = MODULO_META[resumen.modulo] ?? { label: resumen.modulo, icon: ClipboardList, to: '/' }
  const Icon = meta.icon

  return (
    <div className="module-summary-card glass-card">
      <div className="module-summary-card__header">
        <span className="module-summary-card__icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <span className="module-summary-card__label">{meta.label}</span>
        <span className="module-summary-card__total" title="Total de items">
          {resumen.total}
        </span>
      </div>

      <dl className="module-summary-card__counts">
        <div className="module-summary-card__count">
          <dt>Pendientes</dt>
          <dd>{resumen.pendientes}</dd>
        </div>
        <div className="module-summary-card__count">
          <dt>En proceso</dt>
          <dd>{resumen.en_proceso}</dd>
        </div>
        <div className="module-summary-card__count">
          <dt>Completados</dt>
          <dd>{resumen.completados}</dd>
        </div>
        <div className="module-summary-card__count module-summary-card__count--danger">
          <dt>Atrasados</dt>
          <dd>{resumen.atrasados}</dd>
        </div>
      </dl>

      <Link to={meta.to} className="module-summary-card__link">
        Ver {meta.label}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  )
}
