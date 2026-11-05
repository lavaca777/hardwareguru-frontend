import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { authErrorMessage } from '@/auth/errors'
import { useAuth } from '@/auth/useAuth'
import { safeRedirect } from '@/auth/redirect'
import {
  hasFieldErrors,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateRegisterForm,
  type FieldErrors,
} from '@/auth/validation'
import { Button, ProblemNotice, TextField } from '@/components/ui'
import { MIN_PASSWORD } from '@/config'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  const from = safeRedirect(
    (location.state as { from?: string } | null)?.from,
  )
  const passwordMeetsLength = password.length >= MIN_PASSWORD
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword

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

  const handleConfirmChange = (value: string) => {
    setConfirmPassword(value)
    setFormError(null)
    setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors = validateRegisterForm({
      email,
      password,
      confirmPassword,
    })
    setErrors(nextErrors)
    if (hasFieldErrors(nextErrors)) {
      if (nextErrors.email) emailRef.current?.focus()
      else if (nextErrors.password) passwordRef.current?.focus()
      else confirmRef.current?.focus()
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      await register(email, password)
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
        Crear cuenta
      </h1>
      <p className="mt-1 text-sm text-muted">
        Guarda tus builds y recibe avisos cuando necesiten atención.
      </p>

      {formError && (
        <div className="mt-6">
          <ProblemNotice tono="danger" titulo="No pudimos crear la cuenta">
            {formError}
          </ProblemNotice>
        </div>
      )}

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
          autoComplete="new-password"
          placeholder={`Mínimo ${MIN_PASSWORD} caracteres`}
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
                showPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'
              }
              className="rounded px-2 py-1 text-xs text-muted hover:text-ink"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          }
        />

        <ul
          aria-live="polite"
          className="space-y-1.5 text-xs text-muted"
        >
          <li className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                passwordMeetsLength ? 'bg-ok' : 'bg-line'
              }`}
              aria-hidden="true"
            />
            Mínimo {MIN_PASSWORD} caracteres
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                passwordsMatch ? 'bg-ok' : 'bg-line'
              }`}
              aria-hidden="true"
            />
            Las contraseñas coinciden
          </li>
        </ul>

        <TextField
          label="Confirmar contraseña"
          name="confirm-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          inputRef={confirmRef}
          error={errors.confirmPassword}
          onChange={(event) => handleConfirmChange(event.target.value)}
          onBlur={() => {
            const error = validateConfirmPassword(password, confirmPassword)
            setErrors((prev) => ({ ...prev, confirmPassword: error }))
          }}
        />

        <Button type="submit" className="w-full" loading={submitting}>
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link className="text-copper hover:underline" to="/login">
          Inicia sesión
        </Link>
      </p>
    </section>
  )
}
