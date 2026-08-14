// ============================================================================
// bITacora — Administración de usuarios (solo rol ADMIN)
// Tabla (>=860px) o CardList (<860px) + SlideOverPanel con formulario de
// creación/edición + acciones de editar / activar-desactivar / eliminar.
// ============================================================================

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, UserX, UserCheck, Trash2, Search } from 'lucide-react'
import { DataTable } from '../components/common/DataTable'
import { CardList } from '../components/common/CardList'
import { SlideOverPanel } from '../components/common/SlideOverPanel'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { useToast } from '../components/common/ToastProvider'
import { useMediaQuery, BREAKPOINTS } from '../hooks/useMediaQuery'
import { useAuthStore } from '../stores/authStore'
import { esAdmin, type Rol } from '../lib/roles'
import { ApiError } from '../api/client'
import {
  useUsuarios,
  useCrearUsuario,
  useActualizarUsuario,
  useEliminarUsuario,
  type Usuario,
  type UsuarioPayload,
  type NuevoUsuarioPayload,
} from '../api/users'

const ROLES: { value: Rol; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'LECTOR', label: 'Lector' },
]

const ROL_STYLE: Record<Rol, { fg: string; bg: string }> = {
  ADMIN: { fg: 'var(--state-en-curso)', bg: 'var(--state-en-curso-bg)' },
  EDITOR: { fg: 'var(--sem-ok)', bg: 'var(--sem-ok-bg)' },
  LECTOR: { fg: 'var(--sem-gris)', bg: 'var(--sem-gris-bg)' },
}

function rolLabel(rol: Rol): string {
  return ROLES.find((option) => option.value === rol)?.label ?? rol
}

function RolBadge({ rol }: { rol: Rol }) {
  const style = ROL_STYLE[rol]
  return (
    <span className="status-badge" style={{ color: style.fg, backgroundColor: style.bg }}>
      {rolLabel(rol)}
    </span>
  )
}

function ActivoBadge({ activo }: { activo: boolean }) {
  const style = activo
    ? { fg: 'var(--sem-ok)', bg: 'var(--sem-ok-bg)' }
    : { fg: 'var(--sem-danger)', bg: 'var(--sem-danger-bg)' }
  return (
    <span className="status-badge" style={{ color: style.fg, backgroundColor: style.bg }}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function nombreCompleto(usuario: Usuario): string {
  const nombre = `${usuario.first_name} ${usuario.last_name}`.trim()
  return nombre || '—'
}

function esEmailValido(value: string): boolean {
  return value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function describeApiError(error: unknown): string | undefined {
  if (error instanceof ApiError) {
    if (error.data && typeof error.data === 'object') {
      const mensajes = Object.values(error.data as Record<string, unknown>)
        .flat()
        .filter((valor): valor is string => typeof valor === 'string')
      if (mensajes.length > 0) return mensajes.join(' ')
    }
    return error.message
  }
  return undefined
}

// ============================================================================
// Formulario de creación/edición de usuario
// ============================================================================

type UsuarioFormValues = {
  username: string
  password: string
  first_name: string
  last_name: string
  email: string
  rol: Rol
}

function buildUsuarioSchema(isEditing: boolean) {
  return z
    .object({
      username: z.string().min(1, 'El usuario es obligatorio'),
      password: z.string(),
      first_name: z.string(),
      last_name: z.string(),
      email: z.string().refine(esEmailValido, 'Correo inválido'),
      rol: z.enum(['ADMIN', 'EDITOR', 'LECTOR'], { error: 'Selecciona un rol' }),
    })
    .superRefine((values, ctx) => {
      if (!isEditing && values.password.trim().length < 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Debe tener al menos 6 caracteres',
        })
      }
    })
}

type UsuarioFormProps = {
  isEditing: boolean
  defaultValues: UsuarioFormValues
  onSubmit: (values: UsuarioFormValues) => void | Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

function UsuarioForm({ isEditing, defaultValues, onSubmit, onCancel, isSubmitting }: UsuarioFormProps) {
  const schema = useMemo(() => buildUsuarioSchema(isEditing), [isEditing])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <form className="item-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="item-form__grid">
        <div className="field-renderer">
          <label htmlFor="username" className="field-renderer__label">
            Usuario
            <span className="field-renderer__required">*</span>
          </label>
          <input
            id="username"
            type="text"
            className="field-renderer__control"
            autoComplete="off"
            {...register('username')}
          />
          {errors.username && <span className="field-renderer__error">{errors.username.message}</span>}
        </div>

        <div className="field-renderer">
          <label htmlFor="password" className="field-renderer__label">
            Contraseña
            {!isEditing && <span className="field-renderer__required">*</span>}
          </label>
          <input
            id="password"
            type="password"
            className="field-renderer__control"
            autoComplete="new-password"
            placeholder={isEditing ? 'Dejar en blanco para no cambiar' : ''}
            {...register('password')}
          />
          {errors.password && <span className="field-renderer__error">{errors.password.message}</span>}
        </div>

        <div className="field-renderer">
          <label htmlFor="first_name" className="field-renderer__label">
            Nombre
          </label>
          <input id="first_name" type="text" className="field-renderer__control" {...register('first_name')} />
        </div>

        <div className="field-renderer">
          <label htmlFor="last_name" className="field-renderer__label">
            Apellido
          </label>
          <input id="last_name" type="text" className="field-renderer__control" {...register('last_name')} />
        </div>

        <div className="field-renderer">
          <label htmlFor="email" className="field-renderer__label">
            Correo
          </label>
          <input id="email" type="email" className="field-renderer__control" {...register('email')} />
          {errors.email && <span className="field-renderer__error">{errors.email.message}</span>}
        </div>

        <div className="field-renderer">
          <label htmlFor="rol" className="field-renderer__label">
            Rol
            <span className="field-renderer__required">*</span>
          </label>
          <select id="rol" className="field-renderer__control" {...register('rol')}>
            {ROLES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.rol && <span className="field-renderer__error">{errors.rol.message}</span>}
        </div>
      </div>

      <div className="item-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </div>
    </form>
  )
}

// ============================================================================
// Página principal
// ============================================================================

export function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user)
  const isAdmin = esAdmin(currentUser?.rol)

  const [search, setSearch] = useState('')
  const [rolFiltro, setRolFiltro] = useState<Rol | ''>('')
  const [activeUserId, setActiveUserId] = useState<number | 'new' | null>(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState<Usuario | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Usuario | null>(null)

  const { toast } = useToast()
  const isDesktopTable = useMediaQuery(BREAKPOINTS.tableBreak)

  // Solo se golpea el endpoint si quien mira la página es ADMIN.
  const usuariosQuery = useUsuarios({ enabled: isAdmin })
  const crearUsuario = useCrearUsuario()
  const actualizarUsuario = useActualizarUsuario()
  const eliminarUsuario = useEliminarUsuario()

  const usuarios = usuariosQuery.data ?? []

  const items = useMemo(() => {
    const texto = search.trim().toLowerCase()
    return usuarios.filter((usuario) => {
      if (rolFiltro && usuario.rol !== rolFiltro) return false
      if (!texto) return true
      const haystack = `${usuario.username} ${usuario.first_name} ${usuario.last_name} ${usuario.email}`.toLowerCase()
      return haystack.includes(texto)
    })
  }, [usuarios, search, rolFiltro])

  const activeUser =
    typeof activeUserId === 'number' ? usuarios.find((usuario) => usuario.id === activeUserId) ?? null : null
  const isCreateMode = activeUserId === 'new'
  const isPanelOpen = activeUserId !== null

  const handleToggleActivo = (usuario: Usuario): void => {
    if (!usuario.is_active) {
      // Reactivar no requiere confirmación: es una acción reversible y segura.
      actualizarUsuario.mutate(
        { id: usuario.id, payload: { is_active: true } },
        {
          onSuccess: () => toast({ title: 'Usuario activado', variant: 'success' }),
          onError: (error) =>
            toast({ title: 'No se pudo activar', description: describeApiError(error), variant: 'error' }),
        },
      )
      return
    }
    setConfirmDeactivate(usuario)
  }

  const confirmToggleDeactivate = (): void => {
    if (!confirmDeactivate) return
    actualizarUsuario.mutate(
      { id: confirmDeactivate.id, payload: { is_active: false } },
      {
        onSuccess: () => {
          toast({ title: 'Usuario desactivado', variant: 'success' })
          setConfirmDeactivate(null)
        },
        onError: (error) => {
          toast({ title: 'No se pudo desactivar', description: describeApiError(error), variant: 'error' })
          setConfirmDeactivate(null)
        },
      },
    )
  }

  const handleFormSubmit = async (values: UsuarioFormValues): Promise<void> => {
    const password = values.password.trim()

    try {
      if (isCreateMode) {
        const payload: NuevoUsuarioPayload = {
          username: values.username,
          password,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          rol: values.rol,
        }
        await crearUsuario.mutateAsync(payload)
        toast({ title: 'Usuario creado', variant: 'success' })
      } else if (activeUser) {
        const payload: Partial<UsuarioPayload> = {
          username: values.username,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          rol: values.rol,
        }
        if (password) payload.password = password
        await actualizarUsuario.mutateAsync({ id: activeUser.id, payload })
        toast({ title: 'Cambios guardados', variant: 'success' })
      }
      setActiveUserId(null)
    } catch (error) {
      toast({ title: 'No se pudo guardar', description: describeApiError(error), variant: 'error' })
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (!confirmDelete) return
    try {
      await eliminarUsuario.mutateAsync(confirmDelete.id)
      toast({ title: 'Usuario eliminado', variant: 'success' })
      setConfirmDelete(null)
      setActiveUserId(null)
    } catch (error) {
      toast({ title: 'No se pudo eliminar', description: describeApiError(error), variant: 'error' })
      setConfirmDelete(null)
    }
  }

  const columns = useMemo<ColumnDef<Usuario, unknown>[]>(
    () => [
      { header: 'Usuario', accessorKey: 'username' },
      { header: 'Nombre', id: 'nombre', cell: ({ row }) => nombreCompleto(row.original) },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: (info) => (info.getValue() as string) || '—',
      },
      {
        header: 'Rol',
        accessorKey: 'rol',
        cell: (info) => <RolBadge rol={info.getValue() as Rol} />,
      },
      {
        header: 'Activo',
        accessorKey: 'is_active',
        cell: (info) => <ActivoBadge activo={info.getValue() as boolean} />,
      },
      {
        header: 'Acciones',
        id: 'acciones',
        cell: ({ row }) => {
          const usuario = row.original
          const esUsuarioActual = usuario.id === currentUser?.id
          return (
            <div className="row gap-sm">
              <button
                type="button"
                className="icon-btn"
                aria-label={`Editar ${usuario.username}`}
                onClick={(event) => {
                  event.stopPropagation()
                  setActiveUserId(usuario.id)
                }}
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label={usuario.is_active ? `Desactivar ${usuario.username}` : `Activar ${usuario.username}`}
                title={esUsuarioActual && usuario.is_active ? 'No puedes desactivar tu propio usuario' : undefined}
                disabled={esUsuarioActual && usuario.is_active}
                onClick={(event) => {
                  event.stopPropagation()
                  handleToggleActivo(usuario)
                }}
              >
                {usuario.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
              </button>
            </div>
          )
        },
      },
    ],
    [currentUser?.id],
  )

  if (!isAdmin) {
    return (
      <div className="glass-card stack gap-sm" style={{ padding: 24 }}>
        <h2>Acceso restringido</h2>
        <p className="text-2">
          No tienes permiso para acceder a esta sección. La administración de usuarios está disponible
          solo para el rol Administrador.
        </p>
      </div>
    )
  }

  return (
    <div className="admin-users-page stack gap-lg">
      <div className="row gap-md" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Administración de usuarios</h1>
        <button type="button" className="btn btn--primary" onClick={() => setActiveUserId('new')}>
          <Plus size={16} />
          Nuevo usuario
        </button>
      </div>

      <div className="filter-bar glass-card">
        <div className="filter-bar__search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={search}
            placeholder="Buscar por usuario, nombre o correo…"
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Buscar usuario"
          />
        </div>
        <div className="filter-bar__selects">
          <select
            className="filter-bar__select"
            value={rolFiltro}
            onChange={(event) => setRolFiltro(event.target.value as Rol | '')}
            aria-label="Rol"
          >
            <option value="">Rol: todos</option>
            {ROLES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {usuariosQuery.isError && (
        <div className="glass-card" style={{ padding: 16, color: 'var(--sem-danger)' }}>
          No se pudo cargar la lista de usuarios.
        </div>
      )}

      {isDesktopTable ? (
        <DataTable
          columns={columns}
          data={items}
          isLoading={usuariosQuery.isLoading}
          getRowId={(usuario) => String(usuario.id)}
          emptyTitle="Sin usuarios"
          emptyDescription="No hay usuarios que coincidan con la búsqueda actual."
        />
      ) : (
        <CardList
          items={items}
          isLoading={usuariosQuery.isLoading}
          getKey={(usuario) => usuario.id}
          emptyTitle="Sin usuarios"
          emptyDescription="No hay usuarios que coincidan con la búsqueda actual."
          renderItem={(usuario) => {
            const esUsuarioActual = usuario.id === currentUser?.id
            return (
              <div className="stack gap-sm">
                <div className="row gap-sm" style={{ justifyContent: 'space-between' }}>
                  <strong>{usuario.username}</strong>
                  <ActivoBadge activo={usuario.is_active} />
                </div>
                <span className="text-2">{nombreCompleto(usuario)}</span>
                <span className="text-3">{usuario.email || '—'}</span>
                <div className="row gap-sm" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <RolBadge rol={usuario.rol} />
                  <div className="row gap-sm">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Editar ${usuario.username}`}
                      onClick={() => setActiveUserId(usuario.id)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={usuario.is_active ? `Desactivar ${usuario.username}` : `Activar ${usuario.username}`}
                      disabled={esUsuarioActual && usuario.is_active}
                      onClick={() => handleToggleActivo(usuario)}
                    >
                      {usuario.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )
          }}
        />
      )}

      <SlideOverPanel
        open={isPanelOpen}
        onOpenChange={(open) => !open && setActiveUserId(null)}
        title={isCreateMode ? 'Nuevo usuario' : activeUser ? `Editar · ${activeUser.username}` : 'Usuario'}
      >
        {isCreateMode && (
          <UsuarioForm
            isEditing={false}
            defaultValues={{ username: '', password: '', first_name: '', last_name: '', email: '', rol: 'LECTOR' }}
            onSubmit={handleFormSubmit}
            onCancel={() => setActiveUserId(null)}
            isSubmitting={crearUsuario.isPending}
          />
        )}

        {!isCreateMode && activeUser && (
          <div className="stack gap-md">
            <UsuarioForm
              isEditing
              defaultValues={{
                username: activeUser.username,
                password: '',
                first_name: activeUser.first_name,
                last_name: activeUser.last_name,
                email: activeUser.email,
                rol: activeUser.rol,
              }}
              onSubmit={handleFormSubmit}
              onCancel={() => setActiveUserId(null)}
              isSubmitting={actualizarUsuario.isPending}
            />

            <div className="stack gap-sm" style={{ borderTop: '1px solid var(--border-1)', paddingTop: 16 }}>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => setConfirmDelete(activeUser)}
                disabled={activeUser.id === currentUser?.id}
                title={activeUser.id === currentUser?.id ? 'No puedes eliminar tu propio usuario' : undefined}
                style={{ width: 'fit-content' }}
              >
                <Trash2 size={16} />
                Eliminar usuario
              </button>
            </div>
          </div>
        )}

        {!isCreateMode && !activeUser && isPanelOpen && <p className="text-2">Cargando…</p>}
      </SlideOverPanel>

      <ConfirmDialog
        open={confirmDeactivate !== null}
        onOpenChange={(open) => !open && setConfirmDeactivate(null)}
        title="Desactivar usuario"
        description={
          confirmDeactivate
            ? `El usuario "${confirmDeactivate.username}" no podrá iniciar sesión hasta que sea reactivado. ¿Deseas continuar?`
            : undefined
        }
        confirmLabel="Desactivar"
        destructive
        isLoading={actualizarUsuario.isPending}
        onConfirm={confirmToggleDeactivate}
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Eliminar usuario"
        description={
          confirmDelete
            ? `Esta acción eliminará permanentemente al usuario "${confirmDelete.username}". No se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        isLoading={eliminarUsuario.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default AdminUsersPage
