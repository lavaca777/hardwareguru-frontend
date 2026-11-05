import { createContext, useContext, useEffect } from 'react'
import type { Build } from '@/types'

export interface BuildsContextValue {
  builds: Build[]
  cargando: boolean
  error: string | null
  recargar: () => void
  reset: () => void
  ensureLoaded: () => Promise<void>
  eliminar: (id: string) => Promise<void>
}

export const BuildsContext = createContext<BuildsContextValue | null>(null)

export function useBuilds(): BuildsContextValue {
  const context = useContext(BuildsContext)
  if (!context) {
    throw new Error('useBuilds debe usarse dentro de BuildsProvider')
  }

  const { ensureLoaded } = context

  useEffect(() => {
    void ensureLoaded()
  }, [ensureLoaded])

  return context
}
