import { isApiError } from '@/api/errors'

export function simulationErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return 'No pudimos simular la build. Reintenta.'
  }

  switch (error.code) {
    case 'NETWORK':
      return 'No pudimos conectar con el servidor. Reintenta.'
    case 'TIMEOUT':
      return 'La simulación tardó demasiado. Reintenta.'
    case 'CONFIG':
      return 'Falta configurar la URL de la API.'
    case 'NOT_FOUND':
      return 'Una de las piezas ya no está disponible. Revisa tu selección.'
    case 'VALIDATION':
      return 'Revisa tu selección e inténtalo de nuevo.'
    default:
      return 'No pudimos simular la build. Reintenta.'
  }
}

export function saveBuildErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return 'No pudimos guardar la build. Reintenta.'
  }

  if (error.code === 'INCOMPATIBLE_BUILD') {
    return 'No puedes guardar una build incompatible. Revisa las piezas.'
  }

  switch (error.code) {
    case 'NETWORK':
      return 'No pudimos conectar con el servidor. Reintenta.'
    case 'TIMEOUT':
      return 'La solicitud tardó demasiado. Reintenta.'
    case 'CONFIG':
      return 'Falta configurar la URL de la API.'
    case 'VALIDATION':
      return error.message || 'Revisa el nombre de la build.'
    default:
      return 'No pudimos guardar la build. Reintenta.'
  }
}
