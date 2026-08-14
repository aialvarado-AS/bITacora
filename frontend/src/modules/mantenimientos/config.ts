// ============================================================================
// bITacora — Configuración del módulo Mantenimientos (ModuleConfig)
// ============================================================================

import { Wrench } from 'lucide-react'
import type { FieldConfig, ModuleConfig } from '../../lib/moduleConfig.types'
import { ESTADOS, PRIORIDADES } from '../../types/common'
import { TIPOS_MANTENIMIENTO } from './types'

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
    options: [],
    showInTable: true,
    showInFilters: true,
  },
  { key: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: true },
  {
    key: 'fecha_plazo_maximo',
    label: 'Fecha límite',
    type: 'date',
    required: true,
    showInTable: true,
  },
]

const extraFields: FieldConfig[] = [
  {
    key: 'tipo_mantenimiento',
    label: 'Tipo de mantenimiento',
    type: 'select',
    options: TIPOS_MANTENIMIENTO,
    required: true,
    showInTable: true,
    showInFilters: true,
  },
  { key: 'equipo_activo', label: 'Equipo / Activo', type: 'text', showInTable: true },
  { key: 'ubicacion', label: 'Ubicación', type: 'text' },
]

export const mantenimientosConfig: ModuleConfig = {
  key: 'mantenimientos',
  label: 'Mantenimientos',
  icon: Wrench,
  apiBasePath: '/api/mantenimientos/',
  baseFields,
  extraFields,
}
