// ============================================================================
// bITacora — Formateo de fechas y moneda
// ============================================================================

import { format, formatDistanceToNow, parseISO, isValid, addBusinessDays } from 'date-fns'
import { es } from 'date-fns/locale'

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  const date = typeof value === 'string' ? parseISO(value) : value
  return isValid(date) ? date : null
}

export function formatFecha(value: string | Date | null | undefined, pattern = 'dd-MM-yyyy'): string {
  const date = toDate(value)
  if (!date) return '—'
  return format(date, pattern, { locale: es })
}

export function formatFechaHora(value: string | Date | null | undefined): string {
  return formatFecha(value, 'dd-MM-yyyy HH:mm')
}

export function formatFechaRelativa(value: string | Date | null | undefined): string {
  const date = toDate(value)
  if (!date) return '—'
  return formatDistanceToNow(date, { locale: es, addSuffix: true })
}

/** Fecha de hoy en formato YYYY-MM-DD, para prellenar inputs type="date". */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Hoy + n días hábiles (Lun-Vie), en formato YYYY-MM-DD. */
export function addBusinessDaysISO(n: number): string {
  return format(addBusinessDays(new Date(), n), 'yyyy-MM-dd')
}

export function formatCLP(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const numero = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(numero)) return '—'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(numero)
}
