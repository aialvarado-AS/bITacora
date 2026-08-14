// ============================================================================
// bITacora — Formulario de entrada manual (textarea + botón Publicar)
// Oculto por completo si el rol del usuario es LECTOR.
// ============================================================================

import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { crearEntradaManual, BITACORA_FEED_KEY } from '../../api/bitacora'
import { useToast } from '../common/ToastProvider'
import { useAuthStore } from '../../stores/authStore'
import { puedeEditar } from '../../lib/roles'

export function ManualEntryForm() {
  const [texto, setTexto] = useState('')
  const rol = useAuthStore((state) => state.user?.rol)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const crear = useMutation({
    mutationFn: (descripcion: string) => crearEntradaManual(descripcion),
    onSuccess: () => {
      setTexto('')
      queryClient.invalidateQueries({ queryKey: [BITACORA_FEED_KEY] })
      toast({ title: 'Entrada publicada', variant: 'success' })
    },
    onError: () => {
      toast({ title: 'No se pudo publicar la entrada', variant: 'error' })
    },
  })

  if (!puedeEditar(rol)) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const descripcion = texto.trim()
    if (!descripcion) return
    crear.mutate(descripcion)
  }

  return (
    <form className="manual-entry-form glass-card" onSubmit={handleSubmit}>
      <label htmlFor="bitacora-manual-entry" className="visually-hidden">
        Nueva entrada de bitácora
      </label>
      <textarea
        id="bitacora-manual-entry"
        className="manual-entry-form__textarea"
        placeholder="Escribe una entrada manual para la bitácora…"
        rows={3}
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
        disabled={crear.isPending}
      />
      <div className="manual-entry-form__actions">
        <button type="submit" className="btn btn--primary" disabled={crear.isPending || !texto.trim()}>
          <Send size={16} />
          {crear.isPending ? 'Publicando…' : 'Publicar'}
        </button>
      </div>
    </form>
  )
}
