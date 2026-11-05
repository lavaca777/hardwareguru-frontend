import { createContext, useContext } from 'react'

export type ToastTipo = 'ok' | 'warn' | 'error'

export interface ToastOpciones {
  tipo: ToastTipo
  texto: string
  duracionMs?: number
}

export interface ToastItem extends ToastOpciones {
  id: number
}

export interface ToastContextValue {
  mostrar: (opciones: ToastOpciones) => void
  cerrar: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}
