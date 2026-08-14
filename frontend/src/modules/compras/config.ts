// ============================================================================
// bITacora — Configuración del módulo Compras
// ============================================================================

import { ShoppingCart } from 'lucide-react'
import type { FieldConfig, ModuleConfig } from '../../lib/moduleConfig.types'
import { ESTADOS, PRIORIDADES } from '../../types/common'
import { addBusinessDaysISO } from '../../lib/formatters'
import { ExtraFields } from './ExtraFields'

const baseFields: FieldConfig[] = [
  { key: 'titulo', label: 'Título', type: 'text', required: true, showInTable: true },
  { key: 'descripcion', label: 'Descripción', type: 'textarea' },
  {
    key: 'estado',
    label: 'Estado',
    type: 'select',
    options: ESTADOS,
    required: true,
    showInTable: true,
    showInFilters: true,
  },
  {
    key: 'prioridad',
    label: 'Prioridad',
    type: 'select',
    options: PRIORIDADES,
    required: true,
    showInTable: true,
    showInFilters: true,
  },
  {
    key: 'responsable_actual',
    label: 'Responsable',
    type: 'select',
    // Las opciones se completan en tiempo de ejecución con la lista de
    // responsables (GET /api/responsables/), no son estáticas como
    // estado/prioridad.
    options: [],
    showInTable: true,
    showInFilters: true,
  },
  { key: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: true },
  {
    key: 'fecha_plazo_maximo',
    label: 'Plazo máximo',
    type: 'date',
    required: true,
    showInTable: true,
  },
]

const extraFields: FieldConfig[] = [
  { key: 'tiene_oc', label: '¿Aplica OC?', type: 'checkbox' },
  { key: 'numero_oc', label: 'Número de OC', type: 'text', showInTable: true },
  { key: 'centro_costo', label: 'Centro de costo', type: 'text', adminOnly: true, showInTable: true },
]

export const comprasConfig: ModuleConfig = {
  key: 'compras',
  label: 'Compras',
  icon: ShoppingCart,
  apiBasePath: '/api/compras/',
  baseFields,
  extraFields,
  ExtraFieldsComponent: ExtraFields,
  getCreateDefaults: () => ({
    tiene_oc: false,
    centro_costo: 'U010600213',
    // Plazo por defecto en Compras: 3 días hábiles (Lun-Vie) desde hoy.
    // Sigue siendo editable manualmente.
    fecha_plazo_maximo: addBusinessDaysISO(3),
  }),
}
