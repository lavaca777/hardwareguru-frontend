import { isApiError } from '@/api/errors'

export function alertsErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.code === 'NETWORK') {
      return 'No pudimos conectar con el servidor. Reintenta.'
    }
    if (error.code === 'TIMEOUT') {
      return 'La solicitud tardó demasiado. Reintenta.'
    }
    if (error.code === 'CONFIG') {
      return 'Falta configurar la URL de la API.'
    }
  }

  return 'No pudimos cargar las alertas. Reintenta.'
}
