// ============================================================================
// bITacora — Tipos de configuración genérica de módulos
// ============================================================================

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'date'
  | 'number'
  | 'currency'
  | 'user'
  | 'checkbox'

export type FieldOption = {
  value: string
  label: string
}

export type FieldConfig = {
  key: string
  label: string
  type: FieldType
  options?: FieldOption[]
  required?: boolean
  showInTable?: boolean
  showInFilters?: boolean
  /** Solo el rol ADMIN puede editar este campo; el resto lo ve deshabilitado. */
  adminOnly?: boolean
}

export type ModuleConfig = {
  key: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  apiBasePath: string
  baseFields: FieldConfig[]
  extraFields: FieldConfig[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ExtraFieldsComponent?: any
  /** Valores por defecto adicionales al crear un item nuevo de este módulo
   * (más allá del genérico fecha_inicio=hoy que aplica a todos). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCreateDefaults?: () => Record<string, any>
}

type ResponsableComoOpcion = { id: number; nombre: string; area?: string }

/**
 * responsable_actual es el único campo cuyas opciones no son estáticas: se
 * completan en runtime con GET /api/responsables/ (ver useResponsables).
 * Esta función inyecta esas opciones en una copia de la lista de campos.
 */
export function withResponsableOptions(
  fields: FieldConfig[],
  responsables: ResponsableComoOpcion[] | undefined,
): FieldConfig[] {
  if (!responsables) return fields
  return fields.map((field) =>
    field.key === 'responsable_actual'
      ? {
          ...field,
          options: responsables.map((responsable) => ({
            value: String(responsable.id),
            label: responsable.area ? `${responsable.nombre} · ${responsable.area}` : responsable.nombre,
          })),
        }
      : field,
  )
}
