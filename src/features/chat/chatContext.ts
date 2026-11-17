import { createContext, useContext } from 'react'
import type { Mensaje } from '@/types'

export interface ChatContextValue {
  mensajes: Mensaje[]
  abierto: boolean
  cargando: boolean
  error: string | null
  hayNuevaRespuesta: boolean
  abrir: () => void
  cerrar: () => void
  enviar: (texto: string) => Promise<void>
  reintentar: () => Promise<void>
  limpiar: () => void
  reset: () => void
}

export const ChatContext = createContext<ChatContextValue | null>(null)

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider')
  }

  return context
}
