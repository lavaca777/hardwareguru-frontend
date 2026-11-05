import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { authErrorMessage } from '@/auth/errors'
import { useAuth } from '@/auth/useAuth'
import { safeRedirect } from '@/auth/redirect'
import { consumeSessionExpired } from '@/auth/session'
import {
  hasFieldErrors,
  validateEmail,
  validateLoginForm,
  validatePassword,
  type FieldErrors,
} from '@/auth/validation'
import { Button, ProblemNotice, TextField } from '@/components/ui'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [expired] = useState(consumeSessionExpired)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const from = safeRedirect(
    (location.state as { from?: string } | null)?.from,
  )

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setFormError(null)
    setErrors((prev) => ({ ...prev, email: undefined }))
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setFormError(null)
    setErrors((prev) => ({ ...prev, password: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors = validateLoginForm({ email, password })
    setErrors(nextErrors)
    if (hasFieldErrors(nextErrors)) {
      if (nextErrors.email) emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (error) {
      setFormError(authErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Iniciar sesión
      </h1>
      <p className="mt-1 text-sm text-muted">
        Entra para armar y guardar tus builds.
      </p>

      <div className="mt-6 space-y-3">
        {expired && (
          <ProblemNotice tono="info" titulo="Tu sesión expiró">
            Inicia sesión de nuevo para continuar.
          </ProblemNotice>
        )}
        {formError && (
          <ProblemNotice tono="danger" titulo="No pudimos iniciar sesión">
            {formError}
          </ProblemNotice>
        )}
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="tu@correo.com"
          value={email}
          inputRef={emailRef}
          error={errors.email}
          onChange={(event) => handleEmailChange(event.target.value)}
          onBlur={() => {
            const error = validateEmail(email)
            setErrors((prev) => ({ ...prev, email: error }))
          }}
        />

        <TextField
          label="Contraseña"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={password}
          inputRef={passwordRef}
          error={errors.password}
          onChange={(event) => handlePasswordChange(event.target.value)}
          onBlur={() => {
            const error = validatePassword(password)
            setErrors((prev) => ({ ...prev, password: error }))
          }}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={
                showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
              className="rounded px-2 py-1 text-xs text-muted hover:text-ink"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          }
        />

        <Button
          type="submit"
          className="w-full"
          loading={submitting}
        >
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <Link className="text-copper hover:underline" to="/register">
          Regístrate
        </Link>
      </p>
    </section>
  )
}
