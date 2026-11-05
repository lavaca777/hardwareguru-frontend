import { isApiError } from '@/api/errors'

export function catalogErrorMessage(error: unknown): string {
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

  return 'No pudimos cargar el catálogo. Reintenta.'
}

export function componentDetailErrorMessage(error: unknown): string {
  if (isApiError(error) && error.code === 'NOT_FOUND') {
    return 'Ese componente ya no está disponible.'
  }

  return 'No pudimos cargar el detalle. Reintenta.'
}
