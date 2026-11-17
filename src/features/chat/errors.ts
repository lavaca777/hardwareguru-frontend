import { isApiError } from '@/api/errors'

export const CHAT_UNAVAILABLE = 'Guru no está disponible ahora. Reintenta'
export const CHAT_EMPTY = 'Guru no devolvió respuesta. Intenta de nuevo'

export function chatErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (
      error.code === 'AI_UNAVAILABLE' ||
      error.code === 'NETWORK' ||
      error.code === 'TIMEOUT' ||
      error.status >= 500
    ) {
      return CHAT_UNAVAILABLE
    }
  }

  return 'Algo salió mal. Reintenta.'
}
