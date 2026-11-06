import { useRef, useState, type FormEvent } from 'react'
import { api } from '@/api'
import {
  Button,
  Card,
  ProblemNotice,
  TextField,
} from '@/components/ui'
import { MIN_PASSWORD } from '@/config'
import {
  isWrongPasswordError,
  passwordChangeErrorMessage,
} from './errors'
import {
  hasPasswordChangeErrors,
  validatePasswordChange,
  type PasswordChangeErrors,
} from './validation'

export function ChangePasswordCard() {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [errors, setErrors] = useState<PasswordChangeErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const actualRef = useRef<HTMLInputElement>(null)
  const nuevaRef = useRef<HTMLInputElement>(null)
  const confirmacionRef = useRef<HTMLInputElement>(null)

  const limpiarEstado = () => {
    setFormError(null)
    setSuccess(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    limpiarEstado()

    const nextErrors = validatePasswordChange({
      actual,
      nueva,
      confirmacion,
    })
    setErrors(nextErrors)

    if (hasPasswordChangeErrors(nextErrors)) {
      if (nextErrors.actual) actualRef.current?.focus()
      else if (nextErrors.nueva) nuevaRef.current?.focus()
      else confirmacionRef.current?.focus()
      return
    }

    setSubmitting(true)

    try {
      await api.cambiarPassword(actual, nueva)
      setSuccess(true)
      setActual('')
      setNueva('')
      setConfirmacion('')
      setErrors({})
    } catch (error) {
      if (isWrongPasswordError(error)) {
        setErrors({ actual: 'La contraseña actual no es correcta.' })
        actualRef.current?.focus()
      } else {
        setFormError(passwordChangeErrorMessage(error))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-ink">Cambiar contraseña</h2>
      <p className="mt-1 text-xs text-muted">
        Actualiza la contraseña con la que entras a HardwareGuru.
      </p>

      <div className="mt-4 space-y-3" aria-live="polite">
        {success && (
          <ProblemNotice tono="info" titulo="Contraseña actualizada">
            Tu nueva contraseña ya está activa.
          </ProblemNotice>
        )}
        {formError && (
          <ProblemNotice
            tono="danger"
            titulo="No pudimos cambiar la contraseña"
          >
            {formError}
          </ProblemNotice>
        )}
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Contraseña actual"
          name="current-password"
          type="password"
          autoComplete="current-password"
          value={actual}
          inputRef={actualRef}
          error={errors.actual}
          onChange={(event) => {
            setActual(event.target.value)
            setErrors((prev) => ({ ...prev, actual: undefined }))
            limpiarEstado()
          }}
        />

        <TextField
          label="Nueva contraseña"
          name="new-password"
          type="password"
          autoComplete="new-password"
          placeholder={`Mínimo ${MIN_PASSWORD} caracteres`}
          hint={`Mínimo ${MIN_PASSWORD} caracteres.`}
          value={nueva}
          inputRef={nuevaRef}
          error={errors.nueva}
          onChange={(event) => {
            setNueva(event.target.value)
            setErrors((prev) => ({ ...prev, nueva: undefined }))
            limpiarEstado()
          }}
        />

        <TextField
          label="Confirmar nueva contraseña"
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmacion}
          inputRef={confirmacionRef}
          error={errors.confirmacion}
          onChange={(event) => {
            setConfirmacion(event.target.value)
            setErrors((prev) => ({ ...prev, confirmacion: undefined }))
            limpiarEstado()
          }}
        />

        <Button type="submit" loading={submitting}>
          Cambiar contraseña
        </Button>
      </form>
    </Card>
  )
}
