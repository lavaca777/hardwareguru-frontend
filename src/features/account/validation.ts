import { MIN_PASSWORD } from '@/config'

export interface PasswordChangeValues {
  actual: string
  nueva: string
  confirmacion: string
}

export interface PasswordChangeErrors {
  actual?: string
  nueva?: string
  confirmacion?: string
}

export function validatePasswordChange(
  values: PasswordChangeValues,
): PasswordChangeErrors {
  const errors: PasswordChangeErrors = {}

  if (!values.actual) {
    errors.actual = 'Ingresa tu contraseña actual.'
  }

  if (!values.nueva) {
    errors.nueva = 'Ingresa la nueva contraseña.'
  } else if (values.nueva.length < MIN_PASSWORD) {
    errors.nueva = `La nueva contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`
  } else if (values.nueva === values.actual) {
    errors.nueva = 'Elige una contraseña distinta.'
  }

  if (!values.confirmacion) {
    errors.confirmacion = 'Confirma la nueva contraseña.'
  } else if (values.nueva !== values.confirmacion) {
    errors.confirmacion = 'Las contraseñas no coinciden.'
  }

  return errors
}

export function hasPasswordChangeErrors(
  errors: PasswordChangeErrors,
): boolean {
  return Object.keys(errors).length > 0
}
