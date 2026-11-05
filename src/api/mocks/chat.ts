import type { ChatResponse, Mensaje } from '@/types'
import { ApiError } from '../errors'
import { mockDelay } from './delay'

export async function enviarMensaje(
  texto: string,
  _historial: Mensaje[],
): Promise<ChatResponse> {
  await mockDelay()

  const consulta = texto.trim().toLowerCase()

  if (consulta.includes('error')) {
    throw new ApiError(
      503,
      'AI_UNAVAILABLE',
      'Guru no está disponible ahora. Reintenta.',
    )
  }

  if (consulta.includes('fuente')) {
    return {
      respuesta:
        'Revisa el consumo estimado de tu build y deja al menos un 20% de margen sobre la potencia de la fuente.',
    }
  }

  if (consulta.includes('build')) {
    return {
      respuesta:
        'Puedes comparar tus builds guardadas por consumo y cuello de botella desde Mis builds.',
    }
  }

  return {
    respuesta:
      'Soy Guru. Puedo ayudarte con compatibilidad, consumo, rendimiento y tus builds guardadas.',
  }
}
