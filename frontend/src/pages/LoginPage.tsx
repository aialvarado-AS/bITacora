// ============================================================================
// bITacora — Página de inicio de sesión
// ============================================================================

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    try {
      await login.mutateAsync({ username, password })
      navigate('/')
    } catch {
      // El error queda expuesto vía login.isError / login.error para la UI.
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__card glass-strong">
        <div className="login-page__brand">
          <span className="login-page__brand-mark" aria-hidden="true" />
          <h1>bITacora</h1>
        </div>
        <p className="login-page__subtitle">Gestión interna Agrosuper</p>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <div className="field-renderer">
            <label htmlFor="username" className="field-renderer__label">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              className="field-renderer__control"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div className="field-renderer">
            <label htmlFor="password" className="field-renderer__label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="field-renderer__control"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {login.isError && (
            <p className="login-page__error">Usuario o contraseña incorrectos.</p>
          )}

          <button type="submit" className="btn btn--primary login-page__submit" disabled={login.isPending}>
            <LogIn size={16} />
            {login.isPending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
