import { MIN_PASSWORD } from '@/config'

export interface FieldErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues extends LoginFormValues {
  confirmPassword: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string | undefined {
  const value = email.trim()
  if (!value) return 'Ingresa tu correo electrónico.'
  if (!EMAIL_PATTERN.test(value)) return 'Ingresa un correo válido.'

  return undefined
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Ingresa tu contraseña.'
  if (password.length < MIN_PASSWORD) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`
  }

  return undefined
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (!confirmPassword) return 'Confirma tu contraseña.'
  if (password !== confirmPassword) return 'Las contraseñas no coinciden.'

  return undefined
}

export function validateLoginForm(values: LoginFormValues): FieldErrors {
  const errors: FieldErrors = {}
  const emailError = validateEmail(values.email)
  const passwordError = validatePassword(values.password)

  if (emailError) errors.email = emailError
  if (passwordError) errors.password = passwordError

  return errors
}

export function validateRegisterForm(
  values: RegisterFormValues,
): FieldErrors {
  const errors = validateLoginForm(values)
  const confirmError = validateConfirmPassword(
    values.password,
    values.confirmPassword,
  )

  if (confirmError) errors.confirmPassword = confirmError

  return errors
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}
