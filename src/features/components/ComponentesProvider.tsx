import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { api } from '@/api'
import { registerResetHandler } from '@/auth/reset'
import type { Componente, TipoComponente } from '@/types'
import {
  ComponentesContext,
  type ComponentesContextValue,
} from './componentesContext'
import { clearComponentDetailCache } from './detailCache'
import { catalogErrorMessage } from './errors'

export function ComponentesProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Componente[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadedRef = useRef(false)
  const loadingRef = useRef(false)
  const requestIdRef = useRef(0)

  const load = useCallback(async () => {
    if (loadedRef.current || loadingRef.current) return

    loadingRef.current = true
    const requestId = ++requestIdRef.current
    setCargando(true)
    setError(null)

    try {
      const data = await api.listarComponentes()
      if (requestId !== requestIdRef.current) return
      setTodos(data)
      loadedRef.current = true
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return
      setError(catalogErrorMessage(loadError))
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false
        setCargando(false)
      }
    }
  }, [])

  const recargar = useCallback(() => {
    loadedRef.current = false
    void load()
  }, [load])

  const reset = useCallback(() => {
    requestIdRef.current += 1
    loadedRef.current = false
    loadingRef.current = false
    setTodos([])
    setError(null)
    setCargando(false)
    clearComponentDetailCache()
  }, [])

  useEffect(() => registerResetHandler(reset), [reset])

  const porTipo = useMemo<Record<TipoComponente, Componente[]>>(
    () => ({
      cpu: todos.filter((componente) => componente.tipo === 'cpu'),
      placa: todos.filter((componente) => componente.tipo === 'placa'),
      ram: todos.filter((componente) => componente.tipo === 'ram'),
      gpu: todos.filter((componente) => componente.tipo === 'gpu'),
      fuente: todos.filter((componente) => componente.tipo === 'fuente'),
    }),
    [todos],
  )

  const value = useMemo<ComponentesContextValue>(
    () => ({
      todos,
      porTipo,
      cargando,
      error,
      recargar,
      reset,
      ensureLoaded: load,
    }),
    [todos, porTipo, cargando, error, recargar, reset, load],
  )

  return (
    <ComponentesContext.Provider value={value}>
      {children}
    </ComponentesContext.Provider>
  )
}
