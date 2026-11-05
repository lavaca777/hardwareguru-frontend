import type { ChatResponse, Mensaje } from '@/types'
import { apiPost } from './client'

export function enviarMensaje(
  texto: string,
  historial: Mensaje[],
): Promise<ChatResponse> {
  return apiPost<ChatResponse>('/chat', { mensaje: texto, historial })
}
