// ============================================================================
// bITacora — Panel de detalle/edición de un item de módulo
// SlideOverPanel + ItemForm + tabs de Comentarios / Adjuntos / Actividad
// ============================================================================

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Tabs from '@radix-ui/react-tabs'
import { Trash2, Send, Paperclip, MailPlus } from 'lucide-react'
import { SlideOverPanel } from '../../components/common/SlideOverPanel'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { useToast } from '../../components/common/ToastProvider'
import { ItemForm } from '../../forms/ItemForm'
import { apiFetch } from '../../api/client'
import { useModuleItem } from '../../hooks/useModuleItem'
import { useCreateItem } from '../../hooks/useCreateItem'
import { useUpdateItem } from '../../hooks/useUpdateItem'
import { useDeleteItem } from '../../hooks/useDeleteItem'
import { useResponsables } from '../../hooks/useResponsables'
import { useAuthStore } from '../../stores/authStore'
import { esAdmin, puedeEditar } from '../../lib/roles'
import { formatFechaHora, todayISO } from '../../lib/formatters'
import { withResponsableOptions } from '../../lib/moduleConfig.types'
import type { ModuleConfig } from '../../lib/moduleConfig.types'
import type { BaseTrackedItem, Paginated } from '../../types/common'
import type { UsuarioResumen } from '../../api/auth'

export type ModuleDetailPanelProps = {
  config: ModuleConfig
  itemId: number | 'new' | null
  onClose: () => void
}

type ComentarioItem = {
  id: number
  autor: UsuarioResumen | null
  texto: string
  creado_en: string
}

type AdjuntoItem = {
  id: number
  autor: UsuarioResumen | null
  archivo: string
  nombre_original: string
  tamano_bytes: number
  creado_en: string
}

type RegistroActividadItem = {
  id: number
  modulo: string
  tipo: string
  autor: UsuarioResumen | null
  descripcion: string
  campo: string
  valor_anterior: string
  valor_nuevo: string
  creado_en: string
}

function extractList<T>(data: Paginated<T> | T[] | undefined): T[] {
  if (!data) return []
  return Array.isArray(data) ? data : data.results
}

function nombreAutor(autor: UsuarioResumen | null): string {
  if (!autor) return 'Sistema'
  const nombre = `${autor.first_name} ${autor.last_name}`.trim()
  return nombre || autor.username
}

export function ModuleDetailPanel({ config, itemId, onClose }: ModuleDetailPanelProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [comentarioTexto, setComentarioTexto] = useState('')
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const rol = useAuthStore((state) => state.user?.rol)

  const isOpen = itemId !== null
  const isCreateMode = itemId === 'new'
  const editId = typeof itemId === 'number' ? itemId : undefined

  const itemQuery = useModuleItem<BaseTrackedItem>(config, editId)
  const createItem = useCreateItem(config)
  const updateItem = useUpdateItem(config)
  const deleteItem = useDeleteItem(config)
  const { data: responsables } = useResponsables()
  const configConResponsables = useMemo(
    () => ({ ...config, baseFields: withResponsableOptions(config.baseFields, responsables) }),
    [config, responsables],
  )

  // fecha_inicio=hoy aplica siempre; cada módulo puede agregar sus propios
  // defaults (ej. Compras precalcula el plazo a 3 días hábiles).
  const createDefaults = useMemo(
    () => ({ fecha_inicio: todayISO(), ...(config.getCreateDefaults?.() ?? {}) }),
    [config],
  )

  const comentariosQuery = useQuery({
    queryKey: [config.apiBasePath, 'comentarios', editId],
    queryFn: () =>
      apiFetch<Paginated<ComentarioItem> | ComentarioItem[]>(
        `${config.apiBasePath}${editId}/comentarios/`,
      ),
    enabled: editId !== undefined,
  })

  const adjuntosQuery = useQuery({
    queryKey: [config.apiBasePath, 'adjuntos', editId],
    queryFn: () =>
      apiFetch<Paginated<AdjuntoItem> | AdjuntoItem[]>(`${config.apiBasePath}${editId}/adjuntos/`),
    enabled: editId !== undefined,
  })

  const actividadQuery = useQuery({
    queryKey: [config.apiBasePath, 'actividad', editId],
    queryFn: () =>
      apiFetch<Paginated<RegistroActividadItem> | RegistroActividadItem[]>(
        `${config.apiBasePath}${editId}/actividad/`,
      ),
    enabled: editId !== undefined,
  })

  const addComentario = useMutation({
    mutationFn: (texto: string) =>
      apiFetch(`${config.apiBasePath}${editId}/comentarios/`, {
        method: 'POST',
        body: JSON.stringify({ texto }),
      }),
    onSuccess: () => {
      setComentarioTexto('')
      queryClient.invalidateQueries({ queryKey: [config.apiBasePath, 'comentarios', editId] })
    },
  })

  const addAdjunto = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('archivo', file)
      formData.append('nombre_original', file.name)
      return apiFetch(`${config.apiBasePath}${editId}/adjuntos/`, {
        method: 'POST',
        body: formData,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.apiBasePath, 'adjuntos', editId] })
    },
  })

  const enviarRecordatorio = useMutation({
    mutationFn: () =>
      apiFetch<{ detail: string }>(`${config.apiBasePath}${editId}/enviar_recordatorio/`, {
        method: 'POST',
      }),
    onSuccess: () => {
      toast({ title: 'Envío en curso… revisa la pestaña Actividad en unos segundos', variant: 'success' })
      // El envío real corre en segundo plano en el backend (puede demorar
      // unos segundos por reintentos ante SMTP lento); una sola
      // invalidación inmediata no alcanza a mostrarlo, así que se repite
      // una vez más tras una breve espera.
      queryClient.invalidateQueries({ queryKey: [config.apiBasePath, 'actividad', editId] })
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [config.apiBasePath, 'actividad', editId] })
      }, 6000)
    },
    onError: (error: unknown) => {
      const mensaje = error instanceof Error ? error.message : 'No se pudo enviar el correo'
      toast({ title: mensaje, variant: 'error' })
    },
  })

  const defaultValues = useMemo(() => {
    if (isCreateMode || !itemQuery.data) return {}
    const values: Record<string, unknown> = {}
    const allFields = [...config.baseFields, ...config.extraFields]
    allFields.forEach((field) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = (itemQuery.data as any)[field.key]
      values[field.key] = raw ?? ''
    })
    return values
  }, [isCreateMode, itemQuery.data, config.baseFields, config.extraFields])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: Record<string, any>): Promise<void> => {
    try {
      if (isCreateMode) {
        await createItem.mutateAsync(values)
        toast({ title: 'Creado correctamente', variant: 'success' })
      } else if (editId !== undefined) {
        await updateItem.mutateAsync({ id: editId, payload: values })
        toast({ title: 'Cambios guardados', variant: 'success' })
      }
      onClose()
    } catch {
      toast({ title: 'No se pudo guardar', variant: 'error' })
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (editId === undefined) return
    try {
      await deleteItem.mutateAsync(editId)
      toast({ title: 'Eliminado', variant: 'success' })
      setConfirmDeleteOpen(false)
      onClose()
    } catch {
      toast({ title: 'No se pudo eliminar', variant: 'error' })
    }
  }

  const title = isCreateMode ? `Nuevo · ${config.label}` : (itemQuery.data?.titulo ?? config.label)

  return (
    <>
      <SlideOverPanel open={isOpen} onOpenChange={(open) => !open && onClose()} title={title}>
        {isCreateMode && (
          <ItemForm
            config={configConResponsables}
            defaultValues={createDefaults}
            onSubmit={handleSubmit}
            isSubmitting={createItem.isPending}
            submitLabel="Crear"
            onCancel={onClose}
          />
        )}

        {!isCreateMode && itemQuery.isLoading && <p className="text-2">Cargando…</p>}

        {!isCreateMode && itemQuery.data && (
          <Tabs.Root defaultValue="detalle" className="detail-tabs">
            <Tabs.List className="detail-tabs__list">
              <Tabs.Trigger value="detalle" className="detail-tabs__trigger">
                Detalle
              </Tabs.Trigger>
              <Tabs.Trigger value="comentarios" className="detail-tabs__trigger">
                Comentarios
              </Tabs.Trigger>
              <Tabs.Trigger value="adjuntos" className="detail-tabs__trigger">
                Adjuntos
              </Tabs.Trigger>
              <Tabs.Trigger value="actividad" className="detail-tabs__trigger">
                Actividad
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="detalle" className="detail-tabs__content">
              {puedeEditar(rol) && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ marginBottom: 16 }}
                  disabled={!itemQuery.data.responsable_actual_detail?.correo || enviarRecordatorio.isPending}
                  title={
                    itemQuery.data.responsable_actual_detail?.correo
                      ? undefined
                      : 'Este item no tiene un responsable con correo asignado'
                  }
                  onClick={() => enviarRecordatorio.mutate()}
                >
                  <MailPlus size={16} />
                  {enviarRecordatorio.isPending ? 'Enviando…' : 'Enviar recordatorio por correo'}
                </button>
              )}
              <ItemForm
                config={configConResponsables}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={updateItem.isPending}
                submitLabel="Guardar cambios"
                onCancel={onClose}
              />
              {esAdmin(rol) && (
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              )}
            </Tabs.Content>

            <Tabs.Content value="comentarios" className="detail-tabs__content">
              <div className="stack gap-md">
                <form
                  className="row gap-sm"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (comentarioTexto.trim()) addComentario.mutate(comentarioTexto.trim())
                  }}
                >
                  <input
                    type="text"
                    className="field-renderer__control"
                    placeholder="Escribe un comentario…"
                    value={comentarioTexto}
                    onChange={(event) => setComentarioTexto(event.target.value)}
                  />
                  <button type="submit" className="icon-btn" disabled={addComentario.isPending} aria-label="Enviar">
                    <Send size={16} />
                  </button>
                </form>

                {extractList(comentariosQuery.data).length === 0 ? (
                  <EmptyState title="Sin comentarios" description="Todavía no hay comentarios en este item." />
                ) : (
                  <ul className="comment-list">
                    {extractList(comentariosQuery.data).map((comentario) => (
                      <li key={comentario.id} className="comment-list__item glass-card">
                        <div className="row gap-sm" style={{ justifyContent: 'space-between' }}>
                          <strong>{nombreAutor(comentario.autor)}</strong>
                          <span className="text-3">{formatFechaHora(comentario.creado_en)}</span>
                        </div>
                        <p>{comentario.texto}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Tabs.Content>

            <Tabs.Content value="adjuntos" className="detail-tabs__content">
              <div className="stack gap-md">
                <label className="btn btn--ghost" style={{ width: 'fit-content' }}>
                  <Paperclip size={16} />
                  Adjuntar archivo
                  <input
                    type="file"
                    className="visually-hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) addAdjunto.mutate(file)
                      event.target.value = ''
                    }}
                  />
                </label>

                {extractList(adjuntosQuery.data).length === 0 ? (
                  <EmptyState title="Sin adjuntos" description="Todavía no se han subido archivos." />
                ) : (
                  <ul className="attachment-list">
                    {extractList(adjuntosQuery.data).map((adjunto) => (
                      <li key={adjunto.id} className="attachment-list__item glass-card">
                        <a href={adjunto.archivo} target="_blank" rel="noreferrer">
                          {adjunto.nombre_original}
                        </a>
                        <span className="text-3">{formatFechaHora(adjunto.creado_en)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Tabs.Content>

            <Tabs.Content value="actividad" className="detail-tabs__content">
              {extractList(actividadQuery.data).length === 0 ? (
                <EmptyState title="Sin actividad" description="Todavía no hay registros de actividad." />
              ) : (
                <ul className="activity-list">
                  {extractList(actividadQuery.data).map((registro) => (
                    <li key={registro.id} className="activity-list__item">
                      <div className="row gap-sm" style={{ justifyContent: 'space-between' }}>
                        <strong>{nombreAutor(registro.autor)}</strong>
                        <span className="text-3">{formatFechaHora(registro.creado_en)}</span>
                      </div>
                      <p className="text-2">{registro.descripcion}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Tabs.Content>
          </Tabs.Root>
        )}
      </SlideOverPanel>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Eliminar item"
        description="Esta acción no se puede deshacer. ¿Deseas continuar?"
        confirmLabel="Eliminar"
        destructive
        isLoading={deleteItem.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
