import { createContext, useContext, useEffect } from 'react'
import type { Componente, TipoComponente } from '@/types'

export interface ComponentesContextValue {
  todos: Componente[]
  porTipo: Record<TipoComponente, Componente[]>
  cargando: boolean
  error: string | null
  recargar: () => void
  reset: () => void
  ensureLoaded: () => Promise<void>
}

export const ComponentesContext =
  createContext<ComponentesContextValue | null>(null)

export function useComponentes(): ComponentesContextValue {
  const context = useContext(ComponentesContext)
  if (!context) {
    throw new Error(
      'useComponentes debe usarse dentro de ComponentesProvider',
    )
  }

  const { ensureLoaded } = context

  useEffect(() => {
    void ensureLoaded()
  }, [ensureLoaded])

  return context
}
