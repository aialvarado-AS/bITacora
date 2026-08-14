// ============================================================================
// bITacora — Configuración del módulo Proyectos
// ============================================================================

import { FolderKanban } from 'lucide-react'
import type { ModuleConfig } from '../../lib/moduleConfig.types'
import { ESTADOS, PRIORIDADES } from '../../types/common'
import { ExtraFields } from './ExtraFields'

export const proyectosConfig: ModuleConfig = {
  key: 'proyectos',
  label: 'Proyectos',
  icon: FolderKanban,
  apiBasePath: '/api/proyectos/',
  baseFields: [
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
      type: 'user',
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
  ],
  extraFields: [
    { key: 'codigo_proyecto', label: 'Código de proyecto', type: 'text', showInTable: true },
    { key: 'presupuesto', label: 'Presupuesto', type: 'currency' },
    { key: 'avance_pct', label: 'Avance (%)', type: 'number', showInTable: true },
  ],
  ExtraFieldsComponent: ExtraFields,
}
