// ============================================================================
// bITacora — Item individual del feed de la Bitácora
// Icono distinto según tipo (MANUAL vs. automáticos: CREACION/CAMBIO_*/etc),
// autor, fecha relativa (date-fns) y descripción.
// ============================================================================

import { Calendar, Flag, MessageSquare, Paperclip, PenLine, Plus, RefreshCw, User } from 'lucide-react'
import { formatFechaHora, formatFechaRelativa } from '../../lib/formatters'
import { MODULOS_BITACORA, TIPOS_REGISTRO } from '../../api/bitacora'
import type { RegistroActividad, TipoRegistro } from '../../api/bitacora'
import type { UsuarioResumen } from '../../api/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TIPO_ICON: Record<TipoRegistro, any> = {
  MANUAL: PenLine,
  CREACION: Plus,
  CAMBIO_ESTADO: RefreshCw,
  CAMBIO_RESPONSABLE: User,
  CAMBIO_PLAZO: Calendar,
  CAMBIO_PRIORIDAD: Flag,
  COMENTARIO: MessageSquare,
  ADJUNTO: Paperclip,
}

const TIPO_LABELS: Record<TipoRegistro, string> = Object.fromEntries(
  TIPOS_REGISTRO.map((tipo) => [tipo.value, tipo.label]),
) as Record<TipoRegistro, string>

function nombreAutor(autor: UsuarioResumen | null): string {
  if (!autor) return 'Sistema'
  const nombre = `${autor.first_name} ${autor.last_name}`.trim()
  return nombre || autor.username
}

function moduloLabel(modulo: string): string {
  if (!modulo) return ''
  return MODULOS_BITACORA.find((item) => item.value === modulo)?.label ?? modulo
}

export type TimelineItemProps = {
  registro: RegistroActividad
}

export function TimelineItem({ registro }: TimelineItemProps) {
  const Icon = TIPO_ICON[registro.tipo] ?? PenLine
  const isManual = registro.tipo === 'MANUAL'

  return (
    <li className="timeline-item">
      <span
        className={
          isManual ? 'timeline-item__icon timeline-item__icon--manual' : 'timeline-item__icon timeline-item__icon--auto'
        }
        aria-hidden="true"
      >
        <Icon size={16} />
      </span>

      <div className="timeline-item__body glass-card">
        <div className="timeline-item__header">
          <strong className="timeline-item__autor">{nombreAutor(registro.autor)}</strong>
          {registro.modulo && <span className="timeline-item__modulo">{moduloLabel(registro.modulo)}</span>}
          <span className="timeline-item__tipo">{TIPO_LABELS[registro.tipo] ?? registro.tipo}</span>
          <time
            className="timeline-item__fecha"
            dateTime={registro.creado_en}
            title={formatFechaHora(registro.creado_en)}
          >
            {formatFechaRelativa(registro.creado_en)}
          </time>
        </div>

        <p className="timeline-item__desc">{registro.descripcion}</p>

        {registro.campo && (
          <p className="timeline-item__change">
            <span className="text-3">{registro.campo}: </span>
            <span>{registro.valor_anterior || '—'}</span> {'→'} <strong>{registro.valor_nuevo || '—'}</strong>
          </p>
        )}
      </div>
    </li>
  )
}
