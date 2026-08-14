// ============================================================================
// bITacora — Renderizador genérico de campos (react-hook-form + FieldConfig)
// ============================================================================

import { Controller, useFormContext, type ControllerRenderProps } from 'react-hook-form'
import type { FieldConfig } from '../lib/moduleConfig.types'
import { useAuthStore } from '../stores/authStore'
import { esAdmin } from '../lib/roles'

export type FieldRendererProps = {
  field: FieldConfig
}

function renderInput(field: FieldConfig, rhfField: ControllerRenderProps, disabled: boolean) {
  const value = rhfField.value ?? ''

  switch (field.type) {
    case 'checkbox':
      return (
        <input
          id={field.key}
          type="checkbox"
          checked={Boolean(rhfField.value)}
          disabled={disabled}
          onChange={(event) => rhfField.onChange(event.target.checked)}
          onBlur={rhfField.onBlur}
          name={rhfField.name}
          ref={rhfField.ref}
        />
      )
    case 'textarea':
      return (
        <textarea
          id={field.key}
          className="field-renderer__control"
          rows={3}
          disabled={disabled}
          {...rhfField}
          value={value}
        />
      )
    case 'select':
    case 'user':
      return (
        <select
          id={field.key}
          className="field-renderer__control"
          disabled={disabled}
          {...rhfField}
          value={value}
        >
          <option value="">Seleccionar…</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    case 'date':
      return (
        <input
          id={field.key}
          type="date"
          className="field-renderer__control"
          disabled={disabled}
          {...rhfField}
          value={value}
        />
      )
    case 'number':
    case 'currency':
      return (
        <input
          id={field.key}
          type="number"
          className="field-renderer__control"
          disabled={disabled}
          {...rhfField}
          value={value}
          onChange={(event) => {
            const raw = event.target.value
            rhfField.onChange(raw === '' ? '' : Number(raw))
          }}
        />
      )
    default:
      return (
        <input
          id={field.key}
          type="text"
          className="field-renderer__control"
          disabled={disabled}
          {...rhfField}
          value={value}
        />
      )
  }
}

export function FieldRenderer({ field }: FieldRendererProps) {
  const { control, formState } = useFormContext()
  const error = formState.errors[field.key]
  const rol = useAuthStore((state) => state.user?.rol)
  const disabled = Boolean(field.adminOnly && !esAdmin(rol))

  if (field.type === 'checkbox') {
    return (
      <div className="field-renderer field-renderer--checkbox">
        <label htmlFor={field.key} className="field-renderer__checkbox-label">
          <Controller
            name={field.key}
            control={control}
            render={({ field: rhfField }) => renderInput(field, rhfField, disabled)}
          />
          <span>
            {field.label}
            {field.required && <span className="field-renderer__required">*</span>}
          </span>
        </label>
        {error && (
          <span className="field-renderer__error">
            {typeof error.message === 'string' ? error.message : 'Campo inválido'}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="field-renderer">
      <label htmlFor={field.key} className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
        {field.adminOnly && disabled && (
          <span className="text-3" style={{ fontWeight: 400, marginLeft: 6 }}>
            (fijo · solo admin puede editarlo)
          </span>
        )}
      </label>
      <Controller
        name={field.key}
        control={control}
        render={({ field: rhfField }) => renderInput(field, rhfField, disabled)}
      />
      {error && (
        <span className="field-renderer__error">
          {typeof error.message === 'string' ? error.message : 'Campo inválido'}
        </span>
      )}
    </div>
  )
}
