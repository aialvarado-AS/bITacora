// ============================================================================
// bITacora — Formulario genérico de item (react-hook-form + zod)
// Renderiza config.baseFields y luego config.extraFields (o
// config.ExtraFieldsComponent si está definido).
// ============================================================================

import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FieldConfig, ModuleConfig } from '../lib/moduleConfig.types'
import { FieldRenderer } from './FieldRenderer'

function buildFieldSchema(field: FieldConfig): z.ZodTypeAny {
  if (field.type === 'checkbox') {
    return z.boolean().optional()
  }

  const isNumeric = field.type === 'number' || field.type === 'currency'

  if (isNumeric) {
    const schema = z.coerce.number({ error: 'Debe ser un número' })
    return field.required ? schema : schema.optional().nullable()
  }

  const schema = z.string()
  return field.required ? schema.min(1, 'Este campo es obligatorio') : schema.optional().nullable()
}

function buildModuleSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  fields.forEach((field) => {
    shape[field.key] = buildFieldSchema(field)
  })
  return z.object(shape)
}

export type ItemFormProps = {
  config: ModuleConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (values: Record<string, any>) => void | Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
  onCancel?: () => void
}

export function ItemForm({
  config,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Guardar',
  onCancel,
}: ItemFormProps) {
  const allFields = [...config.baseFields, ...config.extraFields]
  const schema = buildModuleSchema(allFields)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<Record<string, any>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {},
  })

  const ExtraFieldsComponent = config.ExtraFieldsComponent

  return (
    <FormProvider {...methods}>
      <form className="item-form" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="item-form__grid">
          {config.baseFields.map((field) => (
            <FieldRenderer key={field.key} field={field} />
          ))}
        </div>

        {config.extraFields.length > 0 && (
          <div className="item-form__grid">
            {ExtraFieldsComponent ? (
              <ExtraFieldsComponent />
            ) : (
              config.extraFields.map((field) => <FieldRenderer key={field.key} field={field} />)
            )}
          </div>
        )}

        <div className="item-form__actions">
          {onCancel && (
            <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : submitLabel}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
