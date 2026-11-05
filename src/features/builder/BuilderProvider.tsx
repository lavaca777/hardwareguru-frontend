import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { registerResetHandler } from '@/auth/reset'
import type { BuildSeleccion, Resolucion } from '@/types'
import { BuilderContext, type BuilderContextValue } from './context'
import { EMPTY_SELECTION } from './rules'

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [seleccion, setSeleccionState] = useState<BuildSeleccion>({
    ...EMPTY_SELECTION,
  })
  const [resolucion, setResolucionState] = useState<Resolucion>('1080p')

  const setSeleccion = useCallback((next: BuildSeleccion) => {
    setSeleccionState(next)
  }, [])

  const setResolucion = useCallback((next: Resolucion) => {
    setResolucionState(next)
  }, [])

  const reset = useCallback(() => {
    setSeleccionState({ ...EMPTY_SELECTION })
    setResolucionState('1080p')
  }, [])

  useEffect(() => registerResetHandler(reset), [reset])

  const value = useMemo<BuilderContextValue>(
    () => ({
      seleccion,
      setSeleccion,
      resolucion,
      setResolucion,
      reset,
    }),
    [seleccion, setSeleccion, resolucion, setResolucion, reset],
  )

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  )
}
