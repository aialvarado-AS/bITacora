// ============================================================================
// bITacora — Campos propios del módulo Proyectos
// codigo_proyecto y presupuesto se renderizan con el FieldRenderer genérico;
// avance_pct usa un slider 0-100 con logica especial propia.
// ============================================================================

import { Controller, useFormContext } from 'react-hook-form'
import { FieldRenderer } from '../../forms/FieldRenderer'
import type { FieldConfig } from '../../lib/moduleConfig.types'

const CODIGO_FIELD: FieldConfig = {
  key: 'codigo_proyecto',
  label: 'Código de proyecto',
  type: 'text',
}

const PRESUPUESTO_FIELD: FieldConfig = {
  key: 'presupuesto',
  label: 'Presupuesto',
  type: 'currency',
}

export function ExtraFields() {
  const { control, formState } = useFormContext()
  const error = formState.errors.avance_pct

  return (
    <>
      <FieldRenderer field={CODIGO_FIELD} />
      <FieldRenderer field={PRESUPUESTO_FIELD} />

      <div className="field-renderer">
        <label htmlFor="avance_pct" className="field-renderer__label">
          Avance (%)
        </label>
        <Controller
          name="avance_pct"
          control={control}
          render={({ field }) => {
            const value = field.value === '' || field.value === null || field.value === undefined
              ? 0
              : Number(field.value)
            return (
              <div className="row gap-sm" style={{ alignItems: 'center' }}>
                <input
                  id="avance_pct"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                  style={{ flex: 1 }}
                />
                <span className="text-2" style={{ minWidth: '3.5ch', textAlign: 'right' }}>
                  {value}%
                </span>
              </div>
            )
          }}
        />
        {error && (
          <span className="field-renderer__error">
            {typeof error.message === 'string' ? error.message : 'Campo inválido'}
          </span>
        )}
      </div>
    </>
  )
}
