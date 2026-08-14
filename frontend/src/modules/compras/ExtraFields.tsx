// ============================================================================
// bITacora — Campos propios del módulo Compras
// tiene_oc/numero_oc: checkbox que habilita el campo de texto solo si se
// marca "Sí". centro_costo: fijo por defecto, solo ADMIN puede editarlo
// (FieldRenderer ya maneja ese bloqueo vía adminOnly).
// ============================================================================

import { Controller, useFormContext } from 'react-hook-form'
import { FieldRenderer } from '../../forms/FieldRenderer'
import type { FieldConfig } from '../../lib/moduleConfig.types'

const TIENE_OC_FIELD: FieldConfig = {
  key: 'tiene_oc',
  label: '¿Aplica orden de compra (OC)?',
  type: 'checkbox',
}

const CENTRO_COSTO_FIELD: FieldConfig = {
  key: 'centro_costo',
  label: 'Centro de costo',
  type: 'text',
  adminOnly: true,
}

export function ExtraFields() {
  const { control, watch } = useFormContext()
  const tieneOc = Boolean(watch('tiene_oc'))

  return (
    <>
      <FieldRenderer field={TIENE_OC_FIELD} />

      <div className="field-renderer">
        <label htmlFor="numero_oc" className="field-renderer__label">
          Número de OC
        </label>
        <Controller
          name="numero_oc"
          control={control}
          render={({ field }) => (
            <input
              id="numero_oc"
              type="text"
              className="field-renderer__control"
              disabled={!tieneOc}
              placeholder={tieneOc ? '' : 'Marca "Aplica OC" para habilitar'}
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

      <FieldRenderer field={CENTRO_COSTO_FIELD} />
    </>
  )
}
