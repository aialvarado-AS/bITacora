// ============================================================================
// bITacora — Configuración del módulo Requerimientos internos
// ============================================================================

import { ClipboardList } from 'lucide-react'
import type { ModuleConfig } from '../../lib/moduleConfig.types'
import { ESTADOS, PRIORIDADES } from '../../types/common'

export const requerimientosConfig: ModuleConfig = {
  key: 'requerimientos',
  label: 'Requerimientos internos',
  icon: ClipboardList,
  apiBasePath: '/api/requerimientos/',
  baseFields: [
    {
      key: 'titulo',
      label: 'Título',
      type: 'text',
      required: true,
      showInTable: true,
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
    },
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
      showInTable: true,
      showInFilters: true,
    },
    {
      key: 'fecha_inicio',
      label: 'Fecha de inicio',
      type: 'date',
      required: true,
    },
    {
      key: 'fecha_plazo_maximo',
      label: 'Plazo máximo',
      type: 'date',
      required: true,
      showInTable: true,
    },
  ],
  extraFields: [
    {
      key: 'solicitante_nombre',
      label: 'Solicitante',
      type: 'text',
      showInTable: true,
    },
    {
      key: 'area_solicitante',
      label: 'Área solicitante',
      type: 'text',
      showInTable: true,
    },
  ],
}

export default requerimientosConfig
