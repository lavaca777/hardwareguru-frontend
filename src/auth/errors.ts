import { isApiError } from '@/api/errors'

export function authErrorMessage(error: unknown): string {
  if (!isApiError(error)) return 'Algo salió mal. Reintenta.'

  switch (error.code) {
    case 'INVALID_CREDENTIALS':
    case 'HTTP_401':
      return 'Correo o contraseña incorrectos.'
    case 'EMAIL_EXISTS':
    case 'HTTP_409':
      return 'Ese correo ya está registrado.'
    case 'VALIDATION':
    case 'HTTP_400':
      return error.message || 'Revisa los datos e inténtalo de nuevo.'
    case 'NETWORK':
      return 'No pudimos conectar con el servidor. Reintenta.'
    case 'TIMEOUT':
      return 'La solicitud tardó demasiado. Reintenta.'
    case 'CONFIG':
      return 'Falta configurar la URL de la API.'
    default:
      return 'Algo salió mal. Reintenta.'
  }
}
