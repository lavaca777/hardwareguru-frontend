import { createContext, useContext } from 'react'
import type { BuildSeleccion, Resolucion } from '@/types'

export interface BuilderContextValue {
  seleccion: BuildSeleccion
  setSeleccion: (seleccion: BuildSeleccion) => void
  resolucion: Resolucion
  setResolucion: (resolucion: Resolucion) => void
  reset: () => void
}

export const BuilderContext = createContext<BuilderContextValue | null>(null)

export function useBuilderContext(): BuilderContextValue {
  const context = useContext(BuilderContext)
  if (!context) {
    throw new Error('useBuilderContext debe usarse dentro de BuilderProvider')
  }

  return context
}
