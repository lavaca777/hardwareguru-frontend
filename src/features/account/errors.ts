import { isApiError } from '@/api/errors'
import { authErrorMessage } from '@/auth/errors'

export function isWrongPasswordError(error: unknown): boolean {
  return (
    isApiError(error) &&
    (error.status === 401 ||
      error.code === 'INVALID_CREDENTIALS' ||
      error.code === 'HTTP_401')
  )
}

export function passwordChangeErrorMessage(error: unknown): string {
  if (isWrongPasswordError(error)) {
    return 'La contraseña actual no es correcta.'
  }

  return authErrorMessage(error)
}
